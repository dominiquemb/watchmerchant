const _ = require('lodash');
const async = require('async');
const nconf = require('nconf');
const stripe = require('stripe')(nconf.get('stripeSecretKey'));

const getAllCustomers = function () {
    return new Promise(async (resolve, reject) => {
        let more = true;
        let customers = [];
        while (more) {
            try {
                const output = await stripe.customers.list({
                    limit: 100,
                });
                customers = customers.concat(output.data);
                more = output['has_more'];
            } catch (e) {
                return reject(e);
            }
        }
        resolve(customers);
    });
};

const createCustomer = function (stripeData) {
    return new Promise(async (resolve, reject) => {
        try {
            resolve(await stripe.customers.create(stripeData));
        } catch (e) {
            reject(e);
        }
    });
};

const getSubscriptionsForCustomer = function (customerId) {
    return new Promise(async (resolve, reject) => {
        try {
            const customer = await stripe.customers.retrieve(customerId);
            resolve(customer.subscriptions.data);
        } catch (e) {
            reject(e);
        }
    });
};

const createAndAttachCardToCustomer = function (customerId, token) {
    return new Promise(async (resolve, reject) => {
        const createdCard = await stripe.customers.createSource(
            customerId,
            {
                source: token.id,
            }
        );
        resolve(createdCard);
    });
};

const getAllProducts = function () {
    return new Promise(async (resolve, reject) => {
        let more = true;
        let services = [];
        while (more) {
            try {
                const output = await stripe.products.list({
                    limit: 100,
                });
                services = services.concat(output.data);
                more = output['has_more'];
            } catch (e) {
                console.log(e);
                return reject(e);
            }
        }
        resolve(services);
    });
};

const getCardsBelongingtoCustomer = function (customerId) {
    return new Promise(async (resolve, reject) => {
        let more = true;
        let cards = [];
        while (more) {
            try {
                const output = await stripe.customers.listCards(
                    customerId
                );
                cards = cards.concat(output.data);
                more = output['has_more'];
            } catch (e) {
                return reject(e);
            }
        }
        resolve(cards);
    });
};

const cancelSubscriptionsToProduct = function (customerId, productId) {
    return new Promise(async (resolve, reject) => {
        const subscriptions = await stripe.subscriptions.list({
            customerId: customerId,
        });
        if (subscriptions.data.length) {
            const toClose = _.filter(subscriptions.data, (sub) => {
                return sub.plan.product === productId;
            });
            _.forEach(toClose, async (subscription) => {
                await stripe.subscriptions.del(subscription.id);
            });
            return resolve();
        }
        return resolve();
    });
};

const getSubscriptionsToProduct = function (customerId, productId) {
    return new Promise(async (resolve, reject) => {
        const subscriptions = await stripe.subscriptions.list({
            customer: customerId,
        });
        if (subscriptions.data.length) {
            const correctProduct = _.filter(subscriptions.data, (sub) => {
                return sub.plan.product === productId;
            });
            return resolve(correctProduct);
        }
        return resolve([]);
    });
};

const updateSubscriptionPlan = function (subscriptionId, newPlanId) {
    return new Promise(async (resolve, reject) => {
        await stripe.subscriptions.update(
            subscriptionId,
            {
                items: [
                    {
                        plan: newPlanId,
                    },
                ],
            }
        );
        return resolve();
    });
};

const listPlansForProduct = function (productId) {
    return new Promise(async (resolve, reject) => {
        try {
            const plans = await stripe.plans.list({ product: productId });
            return resolve(plans.data);
        } catch (e) {
            return reject(e);
        }
    });
};

const subscribeCustomerToPlan = function (customerId, planId) {
    return new Promise(async (resolve, reject) => {
        await stripe.subscriptions.create({
            customer: customerId,
            items: [
                { plan: planId },
            ],
        });
        return resolve();
    });
};

const getAllProductsAndPlans = function () {
    return new Promise(async (resolve, reject) => {
        let products = await getAllProducts();
        async.map(products, (product, done) => {
            if (product.type === 'service') {
                listPlansForProduct(product.id)
                    .then(plans => {
                        product.plans = plans;
                        done(null, product);
                    });
            } else {
                done(null, product)
            }
        }, (error, results) => {
            if (error) {
                return reject(error);
            }
            return resolve(results);
        });
    });
}

const getPlansSubscribedToByCustomer = function (customerId) {
    return new Promise(async (resolve, reject) => {
        const subscriptions = await stripe.subscriptions.list({
            customer: customerId,
        });
        const promises = [];
        const plans = [];
        subscriptions.data.forEach(sub => {
            promises.push(getPlanById(sub.plan.id));
        });
        Promise.all(promises)
            .then(plans => {
                resolve(plans);
            });
    })
};

const getPlanById = function(planId) {
    return new Promise(async (resolve, reject) => {
        const plan = await stripe.plans.retrieve(planId);
        return resolve(plan);
    });
}

module.exports = {
    getAllCustomers,
    createCustomer,
    createAndAttachCardToCustomer,
    getSubscriptionsForCustomer,
    getAllProducts,
    getCardsBelongingtoCustomer,
    cancelSubscriptionsToProduct,
    getSubscriptionsToProduct,
    updateSubscriptionPlan,
    listPlansForProduct,
    subscribeCustomerToPlan,
    getAllProductsAndPlans,
    getPlansSubscribedToByCustomer
};
