const _ = require('lodash');
const nconf = require('nconf');
const googleMaps = require('@google/maps').createClient({
    key: nconf.get('googleMapsAPIKey'),
    Promise: Promise
});

const AuthHelper = require('../utils/authentication');
const BaseController = require('./base.controller');
const Models = require('../models/');

class AdvertController extends BaseController {
    constructor(app) {
        super(app);
        this.app = app;
        this.Advert = Models.adverts;
        this.AdvertImage = Models.advertImages;
        this.Brand = Models.brands;
        this.Product = Models.products;
        this.User = Models.users;

        this.publicFields = {
            seller: [
                'sellerName',
            ],
        };
    }

    route() {
        this.app.getWithApi(
            '/listing/newArrivals',
            this.getNewArrivals.bind(this),
            this.render.bind(this)
        );

        this.app.getWithApi(
            '/listings/user',
            AuthHelper.requireLoggedInUser,
            this.getAdvertsBelongingToLoggedInUser.bind(this),
            this.render.bind(this)
        );

        this.app.postWithApi(
            '/listing/:id/sold',
            AuthHelper.requireLoggedInUser,
            this.markAdvertAsSold.bind(this)
        );

        // This needs to be last in this controller's route list
        this.app.getWithApi(
            '/listing/:id',
            this.getAdvert.bind(this),
            this.getDistance.bind(this),
            this.render.bind(this)
        );
    }

    markAdvertAsSold(request, response, next) {
        this.Advert.findOne({
            where: {
                id: request.params.id
            },
            include: [{
                model: this.User,
                as: 'seller',
                where: {
                    id: request.user.id
                }
            }]
        })
            .then(async advert => {
                if (advert) {
                    await advert.markAsSold();
                    return response.sendStatus(200);
                } else {
                    return response.sendStatus(400);
                }
            });
    }

    getAdvertsBelongingToLoggedInUser(request, response, next) {
        this.Advert.findAll({
            where: {
                sellerId: request.user.id,
                active: true,
                sold: false
            },
            include: [{
                model: this.Product,
                include: [this.Brand],
            }, {
                model: this.User,
                as: 'seller',
            }, {
                model: this.AdvertImage,
                as: 'images',
            }]
        })
            .then(adverts => {
                request.data = {
                    adverts: _.map(adverts, ad => {
                        if (ad.images.length === 0) {

                        }
                        return ad.get({
                            plain: true
                        });
                    })
                }
                next();
            })
    }

    getDistance(request, response, next) {
        if (request.query && request.query.postCode) {
            googleMaps.distanceMatrix({
                origins: [request.query.postCode],
                destinations: [request.data.seller.postCode]
            })
                .asPromise()
                .then(results => {
                    const rows = _.get(results, 'json.rows', []);
                    request.data.advert.distance = rows[0].elements[0].distance.value;
                    next();
                })
                .catch(error => {
                    console.error(error);
                    next();
                })
        } else {
            next();
        }
    }

    getAdvert(request, response, next) {
        return this.Advert.findOne({
            where: {
                id: request.params.id,
            },
            include: [{
                model: this.Product,
                include: [this.Brand],
            }, {
                model: this.User,
                as: 'seller',
            }, {
                model: this.AdvertImage,
                as: 'images',
            }],
        })
            .then((a) => {
                request.data = {};
                if (a) {
                    const data = a.get({
                        plain: true
                    });
                    if (data.images.length) {
                        data.images = _.map(data.images, (image) => {
                            return `http://${nconf.get('advertImageUploadBucket')}/watches/${image.url}`;
                        });
                    }
                    data.seller = _.omit(data.seller, ...this.User.privateFields());
                    request.data.advert = _.omit(data, 'product', 'brand', 'seller');
                    request.data.product = data.product;
                    request.data.brand = data.brand;
                    request.data.seller = data.seller;
                    return next();
                } else {
                    return response.sendStatus(404);
                }
            })
            .catch((error) => {
                console.error(error);
                return response.sendStatus(500);
            });
    }

    getNewArrivals(request, response, next) {
        if (!request.data) request.data = {};
        this.Advert.findAll({
            include: [{
                model: this.AdvertImage,
                as: 'images',
            }, {
                model: this.Product,
                include: [this.Brand],
            }],
            limit: 8,
            order: [['createdAt', 'DESC']],
        }
        )
            .then((newArrivals) => {
                if (newArrivals) {
                    request.data.newArrivals = newArrivals.map((na) => {
                        na = na.get({ plain: true });
                        na.images = na.images.map((image) => {
                            return `http://${nconf.get('advertImageUploadBucket')}/watches/${image.url}`;
                        });
                        return na;
                    })
                } else {
                    request.data.newArrivals = [];
                }
                next();
            });
    }

    renderHtml(request, response, next) {
        const brandData = _.get(request.data, 'product.brand', {});
        const productData = _.get(request.data, 'product', {});
        const sellerData = _.get(request.data, 'seller', {});
        const advertData = _.get(request.data, 'advert', {});
        return response.render('advert', {
            canContactSeller: !!request.user,
            sellerData: sellerData,
            advertData: advertData,
            productData: productData,
            brandData: brandData,
            title: `${_.capitalize(brandData.name)} ${_.capitalize(productData.model)}`,
        });
    }
}

module.exports = AdvertController;