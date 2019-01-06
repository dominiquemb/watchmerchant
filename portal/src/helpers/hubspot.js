const nconf = require('nconf');
const request = require('request');

const NEWSLETTER_FIELD = 'newsletter_subscriber';

function subscribeToNewsletter(email) {
    const options = {
        properties: [
            {
                property: NEWSLETTER_FIELD,
                value: 'Yes'
            }
        ]
    };
    const url = 'https://api.hubapi.com/contacts/v1/contact/createOrUpdate/email/' + email + '?hapikey=' + nconf.get('hubspotAPIKey');
    return _send(url, options, 'POST');
}

function _send(url, options, method) {
    return new Promise((resolve, reject) => {
        request({
            url: url,
            json: options,
            method: method
        }, (error, res, body) => {
            if (error) {
                console.error(error);
                return reject(error);
            } else {
                console.log('Hubspot signup response', body);
                return resolve();
            }
        });
    })
}

module.exports = {
    subscribeToNewsletter
};