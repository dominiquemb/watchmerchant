const _ = require('lodash');
const LocalStrategy = require('passport-local').Strategy;

const Models = require('../models/');
const User = Models.users;

const strategy = new LocalStrategy(
    {
        usernameField: 'email',
    },
    (email, password, done) => {
        User.findOne({
            where: {
                email: email,
            },
        })
        .then((user) => {
            if (user && user.authenticate(password)) {
                console.log(`Successful login for ${user.get({ plain: true }).email}`);
                return done(null, user);
            } else {
                console.log('auth failure', email);
                return done(null, false);
            }
        })
        .catch((error) => {
            console.log('error', error);
            return done(error, false);
        });
    }
);

const serialize = (user, done) => {
    done(null, user.id);
};

const deserialize = (id, done) => {
    User.findById(id)
        .then((user) => {
            done(null, _.omit(user.get({ plain: true }), 'password'));
        })
        .catch((error) => {
            done(error);
        });
};

const requireLoggedInUser = (request, response, next) => {
    if (!request.user) {
        return response.sendStatus(403);
    }
    return next();
};

module.exports = {
    strategy: strategy,
    serializeUser: serialize,
    deserializeUser: deserialize,
    requireLoggedInUser,
};
