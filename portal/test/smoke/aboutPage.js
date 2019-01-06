const assert = require('assert');

describe('The about page', () => {
    it('should load and display the correct title', () => {
        browser.url('/about');
        const title = browser.getTitle();
        assert.equal(title, 'About: Watch Merchant UK | Luxury Watches For Private & Trade Sellers');
    });
});
