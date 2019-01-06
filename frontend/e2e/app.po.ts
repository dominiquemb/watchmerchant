import { browser, by, element } from 'protractor';

export class AppPage {
  navigateTo() {
    return browser.get('/');
  }

  getTitle() {
    return browser.getTitle();
  }

  getLoginLink() {
    return element(by.css('header .login-signup a:first-of-type'));
  }

  getFindMyNextWatchButton() {
    return element(by.css('.landing-page .button-container button'));
  }
}
