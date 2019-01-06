const fs = require('fs');
const nconf = require('nconf');
const path = require('path');
const Sequelize = require('sequelize');

let models = {};

const db = new Sequelize(
    nconf.get('RDS_DB_NAME'),
    nconf.get('RDS_USERNAME'),
    nconf.get('RDS_PASSWORD'),
    {
        host: nconf.get('RDS_HOSTNAME'),
        dialect: 'mysql',
        logging: process.env.WMUK_ENVIRONMENT ? false : console.log, // Only show logging output on local environment
        // logging: false,
    }
);

fs.readdirSync(__dirname).filter((file) => {
    return file.indexOf('.model.js');
}).forEach((file) => {
    if (file === 'index.js') return;
    const model = db.import(path.join(__dirname, file));
    models[model.name] = model;
});

Object.keys(models).forEach((modelName) => {
    if (models[modelName].associate) {
        models[modelName].associate(models);
    }
});
models.sequelize = db;

module.exports = models;
