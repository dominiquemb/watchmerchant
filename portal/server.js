const nconf = require('nconf');
const argv = require('yargs').argv;
nconf.argv().env().file({ file: argv.config ? argv.config : './config.json' });

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const expressJwt = require('express-jwt');
const passport = require('passport');
const session = require('express-session');
const sitemap = require('express-sitemap');

const async = require('async');
const fs = require('fs');

const aws = require('aws-sdk');
aws.config.update({
    accessKeyId: nconf.get('AWS_ACCESS_KEY_ID'),
    secretAccessKey: nconf.get('AWS_SECRET_ACCESS_KEY'),
    region: nconf.get('AWS_REGION')
});

const passportUtils = require('./src/utils/authentication');

const environment = nconf.get('WMUK_ENVIRONMENT');

function setDefaultHeaders(request, response, next) {
    if (environment === 'production' || environment === 'staging') {
        response.setHeader('X-Content-Type-Options', 'nosniff');
        response.setHeader('X-XSS-Protection', '1; mode=block');
        response.setHeader('X-Frame-Options', 'ALLOW-FROM https://www.youtube.com');
        response.setHeader('Access-Control-Allow-Headers', 'content-type, authorization');
        response.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,POST,PUT,DELETE');
    } else {
        response.setHeader('Access-Control-Allow-Origin', '*');
        response.setHeader('Access-Control-Allow-Headers', 'content-type, authorization');
        response.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,POST,PUT,DELETE')
    }
    next();
}

if (process.env.FORCE_HTTPS === 'true') {
    app.use((request, response, next) => {
        if (request.get('x-forwarded-proto') === 'http') {
            return response.redirect('https://' + request.get('host') + request.url);
        } else {
            return next();
        }
    });
}

app.use(bodyParser.json());
app.use(compression());
app.use(cookieParser());
app.use(session({ secret: 'keyboard cat' }));
app.disable('x-powered-by');
app.use(setDefaultHeaders);
app.use(express.static('./public', {
    setHeaders: (response) => {
        response.set('X-Content-Type-Options', 'nosniff');
        response.set('X-XSS-Protection', '1; mode=block');
    },
}));
app.use(fileUpload());
app.set('views', './views');
app.set('view engine', 'pug');

// Ye olde authentication
passport.use(passportUtils.strategy);
passport.serializeUser(passportUtils.serializeUser);
passport.deserializeUser(passportUtils.deserializeUser);
app.use(passport.initialize());
app.use(passport.session());

// Methods to check and then use JWTs
app.use(expressJwt({
    secret: fs.readFileSync('./ssl/auth.key.pub'),
    credentialsRequired: false,
    requestProperty: 'apiUser',
}));

app.use(async (request, response, next) => {
    request.data = {};
    if (request.apiUser) {
        const userId = Number(request.apiUser.sub);
        const User = require('./src/models/').users;
        const user = await User.findById(userId);
        request.user = user;
    }
    return next();
});

app.includeApi = function(method, url, ...args) {
    app[method](...['/:api(api)?' + url].concat(args));
};
['all', 'get', 'patch', 'post', 'put', 'delete'].forEach(function(routing) {
    app[routing + 'WithApi'] = function(...args) {
        app.includeApi.apply(null, [routing].concat(args));
    };
});

if (process.env.WMUK_ENVIRONMENT === 'production') {
    app.locals.googleAnalytics = true;
}

app.locals.videoId = 'deGu6smQ-4w';

const models = require('./src/models');
models.sequelize.sync({ alter: true });

fs.readdir('./src/controllers', (error, files) => {
    async.each(files, (file, done) => {
        if (file === 'base.controller.js') return done();
        const ControllerClass = require(`./src/controllers/${file}`);
        new ControllerClass(app);
        return done();
    }, () => {
        sitemap({
            generate: app,
            sitemap: './public/sitemap.xml',
            robots: './public/robots.txt',
            sitemapSubmission: '/sitemap.xml',
            url: 'www.watchmerchantuk.com',
            hideByRegex: [
                /^\/admin/,
                /^\/version$/,
                /^\/search/,
                /^\/import/,
                /^\/user/,
                /^\/advert/,
            ],
        }).toFile();
        const port = nconf.get('PORT') || 8080;
        app.listen(port, () => {
            console.log(`Now listening on :${port}`);
        });
    });
});
