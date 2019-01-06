import { browser, by, element } from 'protractor';

export class Login {
    navigateTo() {
        browser.get('/account/login');
    }

    getEmailField() {
        return element(by.css('.form-container input[name=email]'));
    }

    getPasswordField() {
        return element(by.css('.form-container input[name=password]'));
    }

    getLoginButton() {
        return element(by.css('.form-container button'));
    }
}