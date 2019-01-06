const nconf = require('nconf');
nconf.argv().env().file({ file: './config.json' });

/**
 * Recursive function to ensure the correct text.
 *
 * This command is created in order to compensate the setValue() bug.
 * The method (setValue) does not always set the correct value,
 * sometimes it just misses some characters.
 * This function sets each character at a time and recursively validates
 * that the character is actually entered.
 *
 * @param {String} selector
 *   The selector string to grab the element by.
 * @param {String} text
 *   The text that we want to set as a value.
 */
browser.addCommand('setValue', (selector, text) => {
    /**
         * Tackle the even weirder decision of WebDriver.io trim the spaces
         * of every property value. Even the "value" property's value.
         * I understand this for class or href properties but not for value.
         * You can see it here : https://github.com/webdriverio/webdriverio/blob/acdd79bff797b295d2196b3616facc9005b6f17d/lib/webdriverio.js#L463
         *
         * @param {String} elementId
         *   ID of a WebElement JSON object of the current element.
         *
         * @return {String}
         *   The value of the `value` attribute.
         */
    let getActualText = (elementId) =>
        browser
            .elementIdAttribute(elementId, 'value')
            .value;

        /**
         * Recursively sets the specified character.
         *
         * @param {String} elementId
         *   ID of a WebElement JSON object of the current element.
         * @param {String} text
         *   The entire text to set.
         * @param {Number} i
         *   The index of the current iteration over the string.
         */
        let setChar = (elementId, text, i) => {
        const currentChar = text[i];
        const expectedText = text.slice(0, i + 1);

        // Send keystroke.
        browser.elementIdValue(elementId, currentChar);

        // Wait for text to be actually entered. If fails - Recurse.
        // When fails after 1000ms we assume the request was somehow destroyed
        // so we activate again.
        try {
            browser
            .waitUntil(() => getActualText(elementId) == expectedText, 1000, 'failed', 16);
        } catch (e) {
            setChar(elementId, text, i);
        }
        };

    // Get the ID of the selected elements WebElement JSON object.
    const elementId = browser.element(selector).value.ELEMENT;

    // Clear the input before entering new value.
    browser.elementIdClear(elementId);
    browser.waitUntil(() => getActualText(elementId) == '');

    // Set each character of the text separately with setChar().
    for (let i = 0; i < text.length; i++) {
        setChar(elementId, text, i);
    }
}, true);
