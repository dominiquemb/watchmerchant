const assert = require('assert');

describe('The front page', () => {
    beforeEach(() => {
        browser.windowHandleSize({ width: 1280, height: 800 });
    });

    it('should load and display the correct title', () => {
        browser.url('/');
        const title = browser.getTitle();
        assert.equal(title, 'Watch Merchant UK | Luxury Watches For Private & Trade Sellers');
    });
});

