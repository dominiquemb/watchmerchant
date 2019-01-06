import { browser, element, by, ExpectedConditions } from 'protractor';
import { SignupTrade } from './signup-trade.po';
import { Login } from './login.po';

function randomString(): string {
    return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
}

function randomEmailAddress(): string {
    return `${randomString()}@${randomString()}.com`;
}

describe('Trade Signup Page', () => {
    let page: SignupTrade;
    let loginPage: Login;

    beforeEach(() => {
        page = new SignupTrade();
    });

    it('should have the confirmation button set to disabled by default', () => {
        page.navigateTo();
        expect(page.getConfirmationButton().isEnabled()).toBe(false);
    });

    it('should enable the confirmation button when the required fields are set', () => {
        page.navigateTo();
        page.getCompanyNameField().sendKeys('Test Company');
        page.getEmailField().sendKeys('test@test.com');
        page.getPasswordField().sendKeys('password');
        page.getPasswordConfirmationField().sendKeys('password');
        expect(page.getConfirmationButton().isEnabled()).toBe(true);
    });

    it('should take the user to the confirmation page on successful signup', () => {
        page.navigateTo();
        page.getCompanyNameField().sendKeys(randomString());
        page.getEmailField().sendKeys(randomEmailAddress());
        page.getPasswordField().sendKeys('password');
        page.getPasswordConfirmationField().sendKeys('password');
        page.getConfirmationButton().click().then(() => {
            expect(ExpectedConditions.textToBePresentInElement(element(by.css('h1')), 'Congratulations'));
        });
    });

    it('should create a user that can then be used to login', () => {
        loginPage = new Login();
        const email = randomEmailAddress();
        page.navigateTo();
        page.getCompanyNameField().sendKeys(randomString());
        page.getEmailField().sendKeys(email);
        page.getPasswordField().sendKeys('password');
        page.getPasswordConfirmationField().sendKeys('password');
        page.getConfirmationButton().click().then(() => {
            loginPage.navigateTo();
            loginPage.getEmailField().sendKeys(email);
            loginPage.getPasswordField().sendKeys('password');
            loginPage.getLoginButton().click().then(() => {
                expect(element(by.css('h1')).getText()).toBe('My Account');                
            });
        });
    })
});