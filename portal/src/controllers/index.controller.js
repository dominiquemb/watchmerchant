const BaseController = require('./base.controller');
const Models = require('../models/');

class IndexController extends BaseController {
    constructor(app) {
        super(app);
        this.Advert = Models.adverts;
        this.AdvertImage = Models.advertImages;
        this.Brand = Models.brands;
        this.Product = Models.products;
    }

    route() {
        this.app.get(
            '/',
            this.getReasonsToUse.bind(this),
            this.renderFrontPage.bind(this)
        );

        this.app.get(
            '/about',
            this.renderAboutPage.bind(this)
        );

        this.app.get(
            '/version',
            this.renderVersionText.bind(this)
        );

        this.app.get(
            '/services',
            this.renderServicesPage.bind(this)
        );
    }

    getReasonsToUse(request, response, next) {
        request.reasonsToUse = [
            { header: 'Listing Adverts', text: 'Extremely cost effective with many options to choose, from Pay as you List to more feature rich Bundle Deals.', imageUrl: '/images/services/checklist.png' },
            { header: 'Search fast', text: 'Our built-in catalogue helps you search and filter for items fast, which ensures buyers watches are found as quickly as possible.', imageUrl: '/images/services/speedometer.png' },
            { header: 'Deal with experts', text: 'We help you at every step of the buying or selling process and our online guides will provide you with advice on everything from servicing a watch to spotting a fake or even just show you nice watches to look at.', imageUrl: '/images/services/tick.png' },
            { header: 'Broker Service', text: 'Choose your item based on the specifications and features needed and receive offers direct from dealers at their best price.', imageUrl: '/images/services/pound.png' },
            { header: 'VIP Appointment Booking', text: 'An additional feature for sellers who want to add that extra air of luxury to a sale and go the extra mile for their customers.', imageUrl: '/images/services/star.png' },
            { header: 'Low Cost', text: 'Prices start from as little as 25p per day!', imageUrl: '/images/services/piggybank.png' },
            { header: 'You in control', text: 'Decide whether you\'d prefer the personal approach and try out the item in store or simply pay for and arrange delivery, it\'s up to you.', imageUrl: '/images/services/control.png' },
            { header: 'Trusted Dealers', text: 'At Watch Merchant UK we believe that a personal touch goes a long way, we give you the opportunity to search thousands of watches; Trade and Private and decide which you’d like to view with the seller of your choice.', imageUrl: '/images/services/handshake.png' },
            { header: 'Try it out', text: 'At Watch Merchant your first Listing Advert is always free.', imageUrl: '/images/services/free.png' },
        ];
        next();
    }

    renderFrontPage(request, response, next) {
        return response.render('frontpage',
        {
            newArrivals: request.newArrivals,
            reasons: request.reasonsToUse,
        });
    }

    renderAboutPage(request, response, next) {
        return response.render('about');
    }

    renderVersionText(request, response) {
        const packageJson = require('../../package.json');
        const version = packageJson.version;
        response.send(version);
    }

    renderServicesPage(request, response) {
        return response.render('services');
    }
}

module.exports = IndexController;
