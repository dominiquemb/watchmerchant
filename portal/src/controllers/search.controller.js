const _ = require('lodash');
const nconf = require('nconf');
const googleMaps = require('@google/maps').createClient({
    key: nconf.get('googleMapsAPIKey'),
    Promise: Promise
});
const sequelize = require('sequelize');
const Op = sequelize.Op;

const Models = require('../models/');
const BaseController = require('./base.controller');

class SearchController extends BaseController {
    constructor(app) {
        super(app);
        this.Advert = Models.adverts;
        this.AdvertImage = Models.advertImages;
        this.Brand = Models.brands;
        this.Product = Models.products;
        this.User = Models.users;
        this.filters = {
            product: [
                'brandId',
                'model',
                'year',
                'movement',
                'gender',
                'caseMaterial',
                'caseDiameter', // Millimetres
                'dialColour',
                'strap',
            ],
            advert: [
                'priceMin', // Prices are in the smallest denomination of the currency
                'priceMax',
                'priceCurrency',
                'new',
                'box',
                'papers',
                'gemstones',
                'condition',
                'serviced',
                'warranty', // Months
                'finance',
                'description',
            ],
        };
    }

    route() {
        this.app.get(
            '/search',
            this.render.bind(this)
        );

        this.app.getWithApi(
            '/search/results',
            this.getBrandIfPresent.bind(this),
            this.getSearchParamsFromQueryString.bind(this),
            this.doSearch.bind(this),
            this.getDistance.bind(this),
            this.render.bind(this)
        );

        this.app.getWithApi(
            '/search/universal',
            this.universalSearch.bind(this),
            this.render.bind(this)
        );

        this.app.getWithApi(
            '/search/brands',
            this.getBrands.bind(this),
            this.render.bind(this)
        );

        this.app.getWithApi(
            '/search/products',
            this.getProductsForBrand.bind(this),
            this.render.bind(this)
        );
    }

    renderHtml(request, response, next) {
        return response.render('search', {
            years: _.range(1900, 2017),
        });
    }

    getBrandIfPresent(request, response, next) {
        request.filters = {
            advert: {},
            product: {},
        };
        if (request.query.brand) {
            this.Brand.findAll({
                where: sequelize.where(sequelize.fn('LOWER', sequelize.col('name')), request.query.brand.toLowerCase()),
                attributes: ['id'],
            })
                .then((brands) => {
                    request.filters.product.brandId = brands ? _.map(brands, (brand) => {
                        return brand.get({ plain: true }).id;
                    }) : [];
                    return next();
                });
        } else {
            return next();
        }
    }

    getSearchParamsFromQueryString(request, response, next) {
        _.each(['product', 'advert'], (filterSetName) => {
            const filters = this.filters[filterSetName];
            if (!request.filters[filterSetName]) request.filters[filterSetName] = {};
            const keys = _.filter(filters, (filter) => {
                return _.includes(Object.keys(request.query), filter);
            });
            _.each(keys, (key) => {
                if (!request.query[key]) return;
                if (key.indexOf('Min') > 0) {
                    const fieldName = key.substring(0, key.indexOf('Min'));
                    if (request.filters[filterSetName][fieldName]) {
                        const preExistingValue = request.filters[filterSetName][fieldName][Object.getOwnPropertySymbols(
                            request.filters[filterSetName][fieldName]
                        )[0]];
                        request.filters[filterSetName][fieldName] = {
                            [Op.between]: [
                                preExistingValue,
                                Number(request.query[key] * 100),
                            ],
                        };
                    } else {
                        request.filters[filterSetName][fieldName] = {
                            [Op.gte]: request.query[key] * 100,
                        };
                    }
                } else if (key.indexOf('Max') > 0) {
                    const fieldName = key.substring(0, key.indexOf('Max'));
                    if (request.filters[filterSetName][fieldName]) {
                        const preExistingValue = request.filters[filterSetName][fieldName][Object.getOwnPropertySymbols(
                            request.filters[filterSetName][fieldName]
                        )[0]];
                        request.filters[filterSetName][fieldName] = {
                            [Op.between]: [
                                preExistingValue,
                                Number(request.query[key] * 100),
                            ],
                        };
                    } else {
                        request.filters[filterSetName][key.substring(0, key.indexOf('Max'))] = {
                            [Op.lte]: request.query[key] * 100,

                        };
                    }
                } else if (key === 'model') {
                    request.filters[filterSetName][key] = {
                        [Op.like]: `%${request.query[key]}%`,
                    };
                } else {
                    request.filters[filterSetName][key] = {
                        [Op.eq]: request.query[key],
                    };
                }
            });
        });
        return next();
    }

    // @TODO:   At the moment, this just searches for the term within the description field. Ideally,
    //          it would probably also search the brand name and model fields.
    universalSearch(request, response, next) {
        request.data = {};
        if (!request.query.searchString) {
            return response.sendStatus(400);
        }
        this.Advert.findAll({
            where: sequelize.where(
                sequelize.fn('LOWER', sequelize.col('description')),
                {
                    [Op.like]: `%${request.query.searchString.toLowerCase()}%`
                }
            ),
            include: [
                {
                    model: this.AdvertImage,
                    as: 'images',
                },
                {
                    model: this.Product,
                    include: this.Brand,
                },
                {
                    model: this.User,
                    as: 'seller',
                    attributes: ['sellerName', 'postCode', 'addressLine1', 'addressLine2', 'city', 'county', 'phoneNumber'],
                },
            ],
            offset: request.query.offset ? Number(request.query.offset) : null,
            limit: request.query.limit ? Number(request.query.limit) : null,
        })
            .then(results => {
                request.data.adverts = _.map(results, (advert) => {
                    const ad = advert.get({ plain: true });
                    if (ad.images.length) {
                        ad.images = _.map(ad.images, (image) => {
                            return `http://${nconf.get('advertImageUploadBucket')}/watches/${image.url}`;
                        });
                    }
                    return ad;
                });
                next();
            });
    }

    doSearch(request, response, next) {
        let orderObject = [];
        if (request.query.sort && request.query.sortDir) {
            if (_.includes(this.filters.product, request.query.sort)) {
                orderObject.push(['products', request.query.sort, request.query.sortDir]);
            } else {
                orderObject.push([request.query.sort, request.query.sortDir]);
            }
        }
        orderObject.push(['createdAt', 'DESC']);
        this.Advert.findAll({
            where: request.filters.advert,
            include: [
                {
                    model: this.AdvertImage,
                    as: 'images',
                },
                {
                    model: this.Product,
                    where: request.filters.product,
                    include: this.Brand,
                },
                {
                    model: this.User,
                    as: 'seller',
                    attributes: ['sellerName', 'postCode', 'addressLine1', 'addressLine2', 'city', 'county', 'phoneNumber'],
                },
            ],
            order: orderObject,
            offset: request.query.offset ? Number(request.query.offset) : null,
            limit: request.query.limit ? Number(request.query.limit) : null,
        }).then((adverts) => {
            request.data = {
                adverts: _.map(adverts, (advert) => {
                    const ad = advert.get({ plain: true });
                    if (ad.images.length) {
                        ad.images = _.map(ad.images, (image) => {
                            return `http://${nconf.get('advertImageUploadBucket')}/watches/${image.url}`;
                        });
                    }
                    return ad;
                })
            };
            return next();
        })
            .catch((error) => {
                console.error(error);
                return response.sendStatus(500);
            });
    }

    renderHtml(request, response) {
        return response.render('results', request.data);
    }

    getDistance(request, response, next) {
        if (request.query.postCode) {
            googleMaps.distanceMatrix({
                origins: [request.query.postCode],
                destinations: _.map(request.data.adverts, ad => ad.seller.postCode)
            })
                .asPromise()
                .then(results => {
                    const rows = _.get(results, 'json.rows', []);
                    rows[0].elements.forEach((e, i) => {
                        request.data.adverts[i].distance = e.distance.value;
                    });
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

    getBrands(request, response, next) {
        this.Brand.findAll({
            order: [['name', 'ASC']]
        })
            .then(brands => {
                request.data = {};
                request.data.brands = _.map(brands, brand => {
                    return brand.get({ plain: true });
                });
                return next();
            })
    }

    getProductsForBrand(request, response, next) {
        this.Product.findAll({
            include: {
                model: this.Brand,
                where: {
                    id: request.query.brandId
                }
            },
            order: [
                ['model', 'ASC']
            ]
        })
            .then(products => {
                request.data.products = _.map(products, product => {
                    return product.get({ plain: true });
                });
                return next();
            });

    }
}

module.exports = SearchController;
