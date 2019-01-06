const bcrypt = require('bcrypt');
const sequelize = require('sequelize');

const stripeHelper = require('../helpers/stripe');

module.exports = function(db, DataTypes) {
    this.Stripe = stripeHelper;
    const tableName = 'users';
    const fields = {
        id: {
            type: sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        email: {
            type: sequelize.STRING,
        },
        password: sequelize.STRING,
        firstName: sequelize.STRING,
        surname: sequelize.STRING,
        passwordResetToken: sequelize.STRING,
        phoneNumber: sequelize.STRING,
        newsletter: {
            type: sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        },
        tradeSeller: {
            type: sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        },
        privateSeller: {
            type: sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        },
        brokerService: {
            type: sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        },
        vipService: {
            type: sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
        maxAdverts: {
            type: sequelize.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },
        admin: {
            type: sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        },
        sellerName: sequelize.STRING,
        sellerCompanyReg: sequelize.STRING,
        lastLogin: sequelize.DATE,
        stripeId: sequelize.STRING,
        addressLine1: sequelize.STRING,
        addressLine2: sequelize.STRING,
        city: sequelize.STRING,
        county: sequelize.STRING,
        postCode: sequelize.STRING,
        defaultCardId: sequelize.STRING,
        companySummary: sequelize.STRING,
        finance: sequelize.BOOLEAN
    };
    const options = {
        indexes: [
            {
                fields: ['email'],
                unique: true,
            },
            {
                fields: ['brokerService'],
            },
            {
                fields: ['newsletter'],
            },
            {
                fields: ['tradeSeller'],
            },
        ],
    };

    const User = db.define(tableName, fields, options);

    User.associate = (models) => {
        User.hasMany(models.adverts);
        User.hasMany(models.imports);
    };

    User.generateHash = (password) => {
        return bcrypt.hashSync(password, 10);
    };

    User.privateFields = () => {
        return [
            'password',
            'passwordResetToken',
            'newsletter',
            'admin',
            'lastLogin',
            'maxAdverts',
        ];
    };

    User.prototype.authenticate = function(password) {
        if (!this.password) return false;
        if (bcrypt.compareSync(password, this.password)) {
            this.update({
                lastLogin: new Date(),
            });
            return this;
        } else {
            return false;
        }
    };

    User.prototype.getSubscriptions = async function() {
        const subscriptions = await stripeHelper.getSubscriptionsForCustomer(this.stripeId);
        return subscriptions;
    };

    User.prototype.getPlans = async function() {
        const plans = await stripeHelper.getPlansSubscribedToByCustomer(this.stripeId);
        return plans;
    }

    User.prototype.createStripeRecord = async function() {
        let metaData = {
            'Name': `${this.firstName} ${this.surname}`,
        };
        if (this.tradeSeller) {
            metaData['Account Type'] = 'Trade Seller';
            metaData['Business Name'] = this.sellerName;
        } else if (this.privateSeller) {
            metaData['Account Type'] = 'Private Seller';
        } else {
            metaData['Account Type'] = 'Buyer';
        }
        const stripeCustomer = await stripeHelper.createCustomer({
            email: this.email,
            metadata: metaData,
        });
        this.update({
            stripeId: stripeCustomer.id,
        });
    };

    User.prototype.createCard = async function(token) {
        try {
            const card = await stripeHelper.createAndAttachCardToCustomer(
                this.stripeId,
                token
            );
            const cardsOnCustomer = await stripeHelper.getCardsBelongingtoCustomer(this.stripeId);
            if (cardsOnCustomer.length === 1) {
                this.update({
                    defaultCardId: card.id,
                });
            }
            return card;
        } catch (e) {
            console.error(e);
            return false;
        }
    };

    User.prototype.getCards = async function() {
        try {
            const cards = await stripeHelper.getCardsBelongingtoCustomer(this.stripeId);
            const processedCards = cards.map((card) => {
                card.isDefault = card.id === this.defaultCardId;
                return card;
            });
            return processedCards;
        } catch (e) {
            console.error(e);
            return false;
        }
    };

    User.prototype.cancelSubscriptionsToProduct = async function(productId) {
        try {
            await stripeHelper.cancelSubscriptionsToProduct(this.stripeId, productId);
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    };

    User.prototype.getSubscriptionsToProduct = async function(productId) {
        try {
            return await stripeHelper.getSubscriptionsToProduct(this.stripeId, productId);
        } catch (e) {
            console.error(e);
            return false;
        }
    };

    User.prototype.updateSubscriptionPlan = async function(subscriptionId, newPlanId) {
        try {
            return await stripeHelper.updateSubscriptionPlan(subscriptionId, newPlanId);
        } catch (e) {
            console.error(e);
            return false;
        }
    };

    User.prototype.subscribeToPlan = async function(planId) {
        try {
            return await stripeHelper.subscribeCustomerToPlan(this.stripeId, planId);
        } catch (e) {
            console.error(e);
            return false;
        }
    };

    return User;
};
