import { element, by, browser, ElementFinder } from 'protractor';

export class AdvertCreation {
    navigateTo() {
        browser.get('/listing/create');
    }

    getBrandField(): ElementFinder {
        return element(by.css('input[formcontrolname=brand]'));
    }

    getModelField(): ElementFinder {
        return element(by.css('input[formcontrolname=model]'));
    }

    getModelNumberField(): ElementFinder {
        return element(by.css('input[formcontrolname=manufacturerRef]'));
    }

    getYearField(): ElementFinder {
        return element(by.css('input[formcontrolname=year]'));
    }

    getPriceField(): ElementFinder {
        return element(by.css('input[formcontrolname=price]'));
    }

    getNewField(): ElementFinder {
        return element(by.css('input[formcontrolname=isNew]'))
    }

    getCaseMaterialField(): ElementFinder {
        return element(by.css('input[formcontrolname=caseMaterial]'));
    }

    getCaseDiameterField(): ElementFinder {
        return element(by.css('input[formcontrolname=caseDiameter]'));
    }

    getDialColourField(): ElementFinder {
        return element(by.css('input[formcontrolname=dialColour]'));
    }

    getStrapMaterialField(): ElementFinder {
        return element(by.css('input[formcontrolname=strap]'));
    }

    getBoxField(): ElementFinder {
        return element(by.css('input[formcontrolname=strap]'));
    }

    getPapersField(): ElementFinder {
        return element(by.css('input[formcontrolname=papers]'));
    }

    getGemstonesField(): ElementFinder {
        return element(by.css('input[formcontrolname=gemstones]'));
    }

    getMovementField(): ElementFinder {
        return element(by.css('input[formcontrolname=movement]'));
    }

    getGenderField(): ElementFinder {
        return element(by.css('input[formcontrolname=gender]'));
    }

    getTypeField(): ElementFinder {
        return element(by.css('input[formcontrolname=type]'));
    }

    getConditionField(): ElementFinder {
        return element(by.css('input[name=conditionRating]'));
    }

    getServicedField(): ElementFinder {
        return element(by.css('input[name=serviced]'));
    }

    getWarrantyField(): ElementFinder {
        return element(by.css('input[name=warranty]'));
    }

    getDescriptionField(): ElementFinder {
        return element(by.css('textarea[formcontrolname=description]'));
    }

    getNextStepsButton(): ElementFinder {
        return element(by.css('form button'));
    }
}