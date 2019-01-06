const DEFAULT_FROM_ADDRESS = 'no-reply@watchmerchantuk.com';

const AWS = require('aws-sdk');
const nconf = require('nconf');

AWS.config.update({
    region: nconf.get('AWS_REGION'),
});

const templatesRequiredFields = {
    basicWithHeader: [
        'name',
        'subject',
        'header',
        'body',
    ],
};

const validate = function(options) {
    if (!options.to) {
        return false;
    }
    if (!options.message) {
        return false;
    }
    if (!options.subject) {
        return false;
    }
    return true;
};

const sendTemplate = function(options, template, templateData) {
    const SES = new AWS.SES();
    return new Promise((resolve, reject) => {
        if (!options.from) {
            options.from = DEFAULT_FROM_ADDRESS;
        }
        const from = options.from;
        const to = options.to;
        if (!from || !to) {
            return reject('From or to address missing');
        }
        if (templatesRequiredFields[template]) {
            templatesRequiredFields[template].forEach((field) => {
                if (!templateData[field]) {
                    return reject(`Required field missing: ${field}`);
                }
            });
        }
        const sesParams = {
            Template: template,
            Source: from,
            Destination: {
                ToAddresses: typeof to === 'string' ? [to] : to,
            },
            TemplateData: JSON.stringify(templateData),
            ConfigurationSetName: 'Default'
        };

        SES.sendTemplatedEmail(sesParams, (error, data) => {
            console.log(sesParams);
            return error ? reject(error) : resolve(data);
        });
    });
};

const send = function(options) {
    const SES = new AWS.SES();
    return new Promise((resolve, reject) => {
        if (!options.from) {
            options.from = DEFAULT_FROM_ADDRESS;
        }
        if (!validate(options)) {
            return reject(options);
        }
        const from = options.from;
        const to = options.to;
        const subject = options.subject;
        const message = options.message;
        SES.sendEmail({
            Source: from,
            Destination: { ToAddresses: [to] },
            Message: {
                Subject: {
                    Data: subject,
                },
                Body: {
                    Text: {
                        Data: message,
                    },
                },
            },
        }, (error, data) => {
            if (error) {
                return reject(error);
            }
            return resolve(data);
        });
    });
};

module.exports = {
    send: send,
    sendTemplate: sendTemplate,
    validate: validate,
};
