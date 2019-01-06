import { browser, ExpectedConditions } from 'protractor';
import { AppPage } from './app.po';

describe('Front page', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display "Watch Merchant UK" as the page title', () => {
    page.navigateTo();
    expect(page.getTitle()).toEqual('Watch Merchant UK');
  });

  it('should take the user to the login page if they click the login link', () => {
    page.navigateTo();
    page.getLoginLink().click().then(() => {
      browser.getCurrentUrl().then((url) => {
        expect(ExpectedConditions.urlContains('/account/login'));
      });
    });
  });

  it('should take the user to the trade signup page if they click the signup link', () => {
    page.navigateTo();
    page.getLoginLink().click().then(() => {
      browser.getCurrentUrl().then((url) => {
        expect(ExpectedConditions.urlContains('/account/create/trade'));
      });
    });
  });

  it('should take the user to the search page if they click the "Find my next Watch" button', () => {
    page.navigateTo();
    page.getFindMyNextWatchButton().click().then(() => {
      browser.getCurrentUrl().then((url) => {
        expect(ExpectedConditions.urlContains('/search'));
      });
    });
  })
});
