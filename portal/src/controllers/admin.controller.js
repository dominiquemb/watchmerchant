const _ = require('lodash');
const BaseController = require('./base.controller');
const Models = require('../models');
const Op = require('sequelize').Op;

class AdminController extends BaseController {
    constructor(app) {
        super(app);
        this.app = app;
        this.Advert = Models.adverts;
        this.Product = Models.products;
        this.User = Models.users;
    }

    route() {
        this.app.get(
            '/admin',
            this.validateUserAsAdmin.bind(this),
            this.getKPIs.bind(this),
            this.renderDashboard.bind(this)
        );

        this.app.get(
            '/admin/users/view',
            this.validateUserAsAdmin.bind(this),
            this.getUsers.bind(this),
            this.renderUsersView.bind(this)
        );
    }

    validateUserAsAdmin(request, response, next) {
        if (!request.user || !request.user.admin) {
            return response.sendStatus(404);
        }
        return next();
    }

    getKPIs(request, response, next) {
        request.kpis = [];
        const kpiPromises = [
            this.User.count().then((count) => {
                request.kpis.push({
                    title: 'Registered Users',
                    value: count,
                    text: 'Total users registered',
                });
            }),
            this.User.count({ where: { 'createdAt': { [Op.gt]: Date.now() - 86400 * 1000 } } }).then((count) => {
                request.kpis.push({
                    title: 'New Users',
                    value: count,
                    text: 'Users registered in the last 24 hours',
                });
            }),
            this.User.count({ where: { 'tradeSeller': { [Op.eq]: true } } }).then((count) => {
                request.kpis.push({
                    title: 'Trade Sellers',
                    value: count,
                    text: 'Trade Seller Accounts',
                });
            }),
            this.User.count({ where: { 'privateSeller': { [Op.eq]: true } } }).then((count) => {
                request.kpis.push({
                    title: 'Private Sellers',
                    value: count,
                    text: 'Private Seller Accounts',
                });
            }),
            this.User.count({ where: { 'brokerService': { [Op.eq]: true } } }).then((count) => {
                request.kpis.push({
                    title: 'Broker Service',
                    value: count,
                    text: 'Broker Service Subscriptions',
                });
            }),
            this.Advert.count().then((count) => {
                request.kpis.push({
                    title: 'Adverts',
                    value: count,
                    text: 'Total adverts in the system',
                });
            }),
            this.Product.count().then((count) => {
                request.kpis.push({
                    title: 'Products',
                    value: count,
                    text: 'Distinct products',
                });
            }),
        ];
        Promise.all(kpiPromises).then(() => {
            next();
        }).catch((error) => {
            response.sendStatus(500);
        });
    }

    renderDashboard(request, response, next) {
        return response.render('admin/dashboard', {
            kpis: request.kpis,
        });
    }

    getUsers(request, response, next) {
        this.User.findAll({
            order: [
                ['surname', 'ASC'],
                ['firstName', 'ASC'],
            ],
        }).then((users) => {
                request.users = _.map(users, (user) => {
                    return user.get({ plain: true });
                });
                return next();
            });
    }

    renderUsersView(request, response, next) {
        return response.render('admin/users/view', {
            users: request.users,
        });
    }
}

module.exports = AdminController;
