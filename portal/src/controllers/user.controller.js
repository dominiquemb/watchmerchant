const _ = require('lodash');
const fs = require('fs');
const httpRequest = require('request');
const nconf = require('nconf');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const uuid = require('uuid');

const Models = require('../models/');
const BaseController = require('./base.controller');

const AuthHelper = require('../utils/authentication');
const HubspotHelper = require('../helpers/hubspot');
const EmailHelper = require('../helpers/email');
const StripeHelper = require('../helpers/stripe');


class UserController extends BaseController {
    constructor(app) {
        super(app);
        this.authHelper = AuthHelper;
        this.emailHelper = EmailHelper;
        this.User = Models.users;

        this.authKey = fs.readFileSync(__dirname + '/../../ssl/auth.key');

    }

    route() {
        this.app.postWithApi(
            '/user/register',
            this.ensureUserDoesNotExist.bind(this),
            this.validateUser.bind(this),
            this.createUser.bind(this),
            this.render.bind(this)
        );

        this.app.get(
            '/user/login',
            (request, response) => {
                response.render('user/login');
            }
        );

        this.app.postWithApi(
            '/user/login',
            this.login.bind(this)
        );

        this.app.get(
            '/user/logout',
            (request, response) => {
                request.logout();
                response.redirect('/');
            }
        );

        this.app.get(
            '/user/dashboard',
            this.validateUserLoggedIn.bind(this),
            this.retrieveSellerListIfAdmin.bind(this),
            this.renderUserDashboard.bind(this)
        );

        this.app.getWithApi(
            '/user/subscriptions',
            AuthHelper.requireLoggedInUser,
            this.getUserSubscriptions.bind(this),
            this.render.bind(this)
        );

        this.app.postWithApi(
            '/user/createCard',
            AuthHelper.requireLoggedInUser,
            this.createCard.bind(this),
            this.render.bind(this)
        );

        this.app.getWithApi(
            '/user/cards',
            AuthHelper.requireLoggedInUser,
            this.listCards.bind(this),
            this.render.bind(this)
        );

        this.app.getWithApi(
            '/user',
            AuthHelper.requireLoggedInUser,
            this.userDetails.bind(this),
            this.render.bind(this)
        );

        this.app.getWithApi(
            '/user/products',
            this.getProductsAndPlans.bind(this),
            this.render.bind(this)
        )

        this.app.postWithApi(
            '/user/subscribe',
            this.subscribeToProducts.bind(this)
        );

        this.app.postWithApi(
            '/user/newsletter/subscribe',
            this.subscribeToNewsletter.bind(this)
        );

        this.app.postWithApi(
            '/user/address',
            this.updateAddress.bind(this)
        );

        this.app.getWithApi(
            '/user/resetToken',
            this.getPasswordResetToken.bind(this)
        );

        this.app.postWithApi(
            '/user/resetPassword',
            this.resetPassword.bind(this)
        );

        this.app.postWithApi(
            '/user/updateCompanyInfo',
            this.updateCompanyInfo.bind(this)
        )
    }

    async login(request, response, next) {
        if (!request.params.api) {
            passport.authenticate('local', {
                successRedirect: '/user/dashboard',
                failureRedirect: '/',
            })(request, response, next);
        } else {
            if (!request.body.email || !request.body.password) {
                return response.sendStatus(400);
            }
            const user = await this.User.findOne({
                where: {
                    email: request.body.email,
                },
            });
            if (user && user.authenticate(request.body.password)) {
                const token = jwt.sign({}, this.authKey, {
                    algorithm: 'RS256',
                    expiresIn: '2 weeks',
                    subject: String(user.id),
                });
                const expiry = new Date();
                expiry.setDate(expiry.getDate() + 14)
                return response.status(200).send({
                    idToken: token,
                    expiresIn: Number(expiry - new Date())
                });
            } else {
                return response.sendStatus(401);
            }
        }
    }

    validateUserLoggedIn(request, response, next) {
        if (!request.user) {
            return response.redirect('/user/login');
        }
        return next();
    }

    retrieveSellerListIfAdmin(request, response, next) {
        if (request.user.admin) {
            this.User.findAll({
                where: {
                    tradeSeller: true,
                },
                order: [
                    ['sellerName', 'DESC'],
                ],
            })
                .then((sellers) => {
                    request.sellers = _.map(sellers, (seller) => {
                        return seller.get({ plain: true });
                    });
                    next();
                });
        } else {
            next();
        }
    }

    renderUserDashboard(request, response, next) {
        let data = {
            user: request.user,
        };
        if (request.sellers) {
            data.sellers = request.sellers;
        }
        return response.render('user/dashboard', data);
    }

    renderRegistrationPage(request, response) {
        return response.render('user/register');
    }

    ensureUserDoesNotExist(request, response, next) {
        return this.User.findOne({ where: { email: request.body.email } })
            .then((user) => {
                if (user) {
                    response.sendStatus(403);
                } else {
                    next();
                }
            });
    }

    validateUser(request, response, next) {
        if (request.body.email && request.body.password && (request.body.companyName || (request.body.firstName && request.body.surname))) {
            return next();
        }
        return response.sendStatus(400);
    }

    async createUser(request, response, next) {
        let creationOptions = {
            email: request.body.email,
            password: this.User.generateHash(request.body.password),
            postCode: request.body.postCode,
            sellerName: request.body.companyName
        };
        if (request.body.companyReg) {
            creationOptions.sellerCompanyReg = request.body.companyReg;
        }
        const user = await this.User.create(creationOptions);
        user.createStripeRecord();
        this.emailHelper.sendTemplate(
            { to: creationOptions.email },
            'BasicWithHeader',
            {
                subject: 'Welcome to Watch Merchant UK',
                header: 'Thank you for registering',
                name: request.body.companyName,
                body: fs.readFileSync('./static/emailTemplates/content/user-registration.html', 'utf8'),
                textBody: fs.readFileSync('./static/emailTemplates/content/user-registration.txt', 'utf8'),
            }
        );

        return next();
    }

    async getUserSubscriptions(request, response, next) {
        const subs = await request.user.getSubscriptions();
        const plans = await request.user.getPlans();
        request.data.subs = subs;
        request.data.plans = plans;
        const services = {
            maxAdverts: _.get(_.first(_.orderBy(plans, 'metadata.maxAdverts', 'desc')), 'metadata.maxAdverts', 0),
            vipService: _.some(plans, plan => plan.metadata.vipService),
            brokerService: _.some(plans, plan => plan.metadata.brokerService),
            tradeSeller: _.some(plans, plan => plan.metadata.tradeSeller),
            privateSeller: _.some(plans, plan => plan.metadata.privateSeller)
        };
        if (services.maxAdverts > 2147483647) {
            services.maxAdverts = 2147483647;
        }
        request.user.update(services)
            .then(() => {
                next()
            })
            .catch((error) => {
                console.error(error);
                return response.sendStatus(500)
            });
    }

    async createCard(request, response, next) {
        const card = await request.user.createCard(request.body.token);
        if (card) {
            request.data = {
                card: card,
            };
            return next();
        } else {
            return response.sendStatus(500);
        }
    }

    async listCards(request, response, next) {
        const cards = await request.user.getCards();
        request.data.cards = _.map(cards, (card) => {
            card.isDefault = (card.id === request.user.defaultCardId);
            return card;
        });
        return next();
    }

    async userDetails(request, response, next) {
        request.data.user = _.omit(
            request.user.get({ plain: true }),
            'password'
        );
        return next();
    }

    async getProductsAndPlans(request, response, next) {
        request.data = {};
        request.data.products = await StripeHelper.getAllProductsAndPlans();
        return next();
    }

    async subscribeToProducts(request, response, next) {
        request.body.subscriptions.forEach(async s => {
            if (!s.planId) return;
            let existingSubscription = false;
            try {
                existingSubscription = await request.user.getSubscriptionsToProduct(s.productId);
            } catch (e) {
                console.error(e);
                response.sendStatus(500);
                return;
            }
            if (existingSubscription.length) {
                // User already subscribed
                if (existingSubscription.plan.product === s.productId) {
                    // No change
                    return;
                }
                // Update them to the new plan
                try {
                    await request.user.updateSubscriptionPlan(existingSubscription.id, s.planId);
                } catch (e) {
                    console.error(e);
                    return response.sendStatus(500);
                }
            } else {
                console.log('New subscription woooo!')
                // Brand new subscription
                try {
                    await request.user.subscribeToPlan(s.planId);
                } catch (e) {
                    return response.sendStatus(500);
                }
            }
        })

        return response.sendStatus(200);
    }

    subscribeToNewsletter(request, response, next) {
        if (request.body.email) {
            HubspotHelper.subscribeToNewsletter(request.body.email)
                .then(() => {
                    return response.sendStatus(200);
                })
                .catch(() => {
                    return response.sendStatus(500);
                })
        } else {
            return response.sendStatus(400);
        }
    }

    updateAddress(request, response, next) {
        if (!request.body.address) {
            return response.sendStatus(400);
        }
        const address = request.body.address;
        request.user.update({
            sellerName: address.companyName,
            sellerCompanyReg: address.companyReg,
            addressLine1: address.addressLine1,
            addressLine2: address.addressLine2,
            city: address.city,
            county: address.county,
            postCode: address.postCode
        })
            .then(() => {
                return response.sendStatus(200);
            })
            .catch(error => {
                console.error(error);
                return response.sendStatus(500);
            })
    }

    getPasswordResetToken(request, response, next) {
        if (!request.query.email) {
            return response.sendStatus(400);
        }
        this.User.findOne({
            where: {
                email: request.query.email
            }
        })
            .then(user => {
                if (user) {
                    const token = uuid.v4();
                    user.update({
                        passwordResetToken: token
                    })
                        .then(() => {
                            const resetLinkHtml = `<p><a href="//www.watchmerchantuk.com/account/reset-password/${user.email}/${user.passwordResetToken}>Reset Password</a></p>`;
                            const resetLinkText = `https://www.watchmerchantuk.com/account/reset-password/${user.email}/${user.passwordResetToken}`;
                            this.emailHelper.sendTemplate(
                                { to: user.email },
                                'BasicWithHeader',
                                {
                                    subject: 'Password Reset',
                                    header: 'Reset your Password',
                                    name: user.sellerName,
                                    body: fs.readFileSync('./static/emailTemplates/content/password-reset.html', 'utf8') + resetLinkHtml,
                                    textBody: fs.readFileSync('./static/emailTemplates/content/password-reset.txt', 'utf8') + resetLinkText,
                                }
                            ).then(sesResponse => {
                                response.sendStatus(200);
                            })
                            return;
                        })
                } else {
                    return response.sendStatus(400);
                }
            })
    }

    resetPassword(request, response, next) {
        if (!request.body.email || !request.body.token || !request.body.password) {
            return response.sendStatus(400);
        }
        this.User.findOne({
            where: {
                email: request.body.email,
                passwordResetToken: request.body.token
            }
        })
            .then(user => {
                if (user) {
                    user.update({
                        password: this.User.generateHash(request.body.password)
                    })
                        .then(() => {
                            return response.sendStatus(200);
                        })
                        .catch(() => {
                            return response.sendStatus(500);
                        })
                } else {
                    return response.sendStatus(400);
                }
            })
    }

    updateCompanyInfo(request, response) {
        if (!request.body.details) {
            return response.sendStatus(400);
        }
        const details = {
            companySummary: request.body.details.companySummary,
            finance: !!request.body.details.finance
        }
        request.user.update(details)
            .then(() => {
                return response.sendStatus(200);
            })
            .catch(error => {
                console.error(error);
                return response.sendStatus(500);
            });
    }
}

module.exports = UserController;
