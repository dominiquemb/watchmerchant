require('./helpers/setup');

const assert = require('assert');
const userHelper = require('./helpers/user');

function closeModalIfVisible() {
    if (browser.isExisting('.modal-video-close-btn') && browser.isVisible('.modal-video-close-btn')) {
        browser.click('.modal-video-close-btn');
    }
}

function generateEmailAddressForUser() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < 5; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return `${text}@email.com`;
}

describe('User creation', () => {
    beforeEach(() => {
        browser.windowHandleSize({ width: 1280, height: 800 });
    });

    it('should create a user when all four expected pieces of information are provided', () => {
        browser.url('/');
        closeModalIfVisible();
        const email = generateEmailAddressForUser();
        browser.setValue('input[name=email]', email);
        browser.setValue('input[name=password]', 'password');
        browser.setValue('input[name=firstName]', 'Joe');
        browser.setValue('input[name=surname]', 'Bloggs');
        browser.click('.newsletter-signup-submit');
        browser.waitForText('.newsletter-signup table tr:last-of-type td', 2000, 'Your registration is complete, please check you inbox for confirmation. You may need to check your Spam or Junk folder as well.<br />If you don\'t receive an email in the next 24 hours, please contact our support team by email at support@watchmerchantuk.com');
        userHelper.findOne({
            email: email,
            firstName: 'Joe',
            surname: 'Bloggs',
        })
        .then((user) => {
            assert(user);
            userHelper.delete(email);
        })
        .catch(() => {
            userHelper.delete(email);
        });
    });

    it('should allow a created user to log in with the supplied details', () => {
        browser.deleteCookie('connect.sid');
        browser.url('/');
        const email = generateEmailAddressForUser();
        closeModalIfVisible();
        browser.setValue('input[name="email"]', email);
        browser.setValue('input[name=password]', 'password');
        browser.setValue('input[name=firstName]', 'Joe');
        browser.setValue('input[name=surname]', 'Bloggs');
        browser.click('.newsletter-signup-submit');
        userHelper.login(browser, email, 'password');
        assert(browser.getCookie('connect.sid'));
        userHelper.delete(email);
    });
});
