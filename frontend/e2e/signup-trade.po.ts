import { browser, by, element } from 'protractor';

export class SignupTrade {
    navigateTo() {
        return browser.get('/account/create/trade');
    }

    getCompanyNameField() {
        return element(by.css('input[name=company-name]'));
    }

    getCompanyRegField() {
        return element(by.css('input[name=company-reg]'));
    }

    getEmailField() {
        return element(by.css('input[name=email]'));
    }

    getPasswordField() {
        return element(by.css('input[name=password]'));
    }

    getPasswordConfirmationField() {
        return element(by.css('input[name=password-confirmation]'));
    }

    getConfirmationButton() {
        return element(by.css('.form-container button'));
    }
}