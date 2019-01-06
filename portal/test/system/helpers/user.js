const Models = require('../../../src/models/');
const User = Models.users;

module.exports.login = (browser, email, password) => {
    browser.url('/user/login');
    browser.setValue('input[name=email]', email);
    browser.setValue('input[name=password]', 'password');
    browser.click('form button');
};

module.exports.delete = (email) => {
    return User.destroy({
        where: {
            email: email,
        },
    });
};

module.exports.findOne = (where) => {
    return User.findOne({
        where: where,
    });
};
