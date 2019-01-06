const _ = require('lodash');
const async = require('async');
const nconf = require('nconf');

const BaseController = require('./base.controller');
const Models = require('../models/');
const stripe = require('../helpers/stripe');

class PaymentController extends BaseController {
    constructor(app) {
        super(app);
        this.Stripe = stripe;
        this.User = Models.users;
        if (nconf.get('stripeSecretKey')) {
            this.syncCustomers();
        }
    }

    /**
     * Ensure that all trade and private sellers exist within Stripe
     */
    async syncCustomers() {
        try {
            const knownCustomers = await stripe.getAllCustomers();
            const customers = await this.User.findAll();
            const newCustomers = customers.filter((customer) => {
                return !_.some(knownCustomers, (kc) => {
                    return kc.email === customer.email;
                });
            });
            async.eachLimit(newCustomers, 10, async (c) => {
                c.createStripeRecord();
            });
        } catch (e) {
            console.error(e);
        }
    }
}

module.exports = PaymentController;
