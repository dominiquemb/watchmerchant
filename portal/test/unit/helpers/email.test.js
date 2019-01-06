const assert = require('assert');
const proxyquire = require('proxyquire');
const sinon = require('sinon');

let SESMock = function() {};
SESMock.prototype.sendEmail = sinon.stub().yields();
SESMock.prototype.sendTemplatedEmail = sinon.stub().yields();

const emailHelper = proxyquire('../../../src/helpers/email', {
    'aws-sdk': {
        SES: SESMock,
    },
});

describe('#helpers/email', () => {
    describe('#validate', () => {
        it('should return false if no to address is provided', () => {
            const result = emailHelper.validate({
                subject: 'a',
                message: 'b',
            });
            assert.equal(result, false);
        });

        it('should return false if no subject is provided', () => {
            const result = emailHelper.validate({
                to: 'a',
                message: 'b',
            });
            assert.equal(result, false);
        });

        it('should return false if no message is provided', () => {
            const result = emailHelper.validate({
                to: 'a',
                subject: 'b',
            });
            assert.equal(result, false);
        });

        it('should return true if all fields are provided', () => {
            const result = emailHelper.validate({
                to: 'a',
                subject: 'a',
                message: 'b',
            });
            assert.equal(result, true);
        });
    });

    describe('#send', () => {
        let options;
        let sesOptions;
        beforeEach(() => {
            options = {
                from: 'from',
                to: 'to',
                subject: 'subject',
                message: 'message',
            };
            sesOptions = {
                Source: options.from,
                Destination: { ToAddresses: [options.to] },
                Message: {
                    Subject: {
                        Data: options.subject,
                    },
                    Body: {
                        Text: {
                            Data: options.message,
                        },
                    },
                },
            };
        });

        it('should reject if a required field is missing', (done) => {
            options.to = null;
            emailHelper.send(options).catch(() => {
                done();
            });
        });

        it('should automatically set the default from address if it isn\'t provided', (done) => {
            options.from = null;
            sesOptions.Source = 'no-reply@watchmerchantuk.com';
            emailHelper.send(options)
            .then(() => {
                assert(SESMock.prototype.sendEmail.calledWith(sesOptions));
                done();
            });
        });

        it('should pass the provided from address if it is provided', (done) => {
            options.from = 'test@emailaddress.com';
            sesOptions.Source = options.from;
            emailHelper.send(options)
            .then(() => {
                assert(SESMock.prototype.sendEmail.calledWith(sesOptions));
                done();
            });
        });

        it('should pass the provided subject', (done) => {
            options.subject = 'test subject';
            sesOptions.Message.Subject.Data = options.subject;
            emailHelper.send(options)
            .then(() => {
                assert(SESMock.prototype.sendEmail.calledWith(sesOptions));
                done();
            });
        });

        it('should pass the provided recipient address', (done) => {
            options.to = 'test@emailaddress.com';
            sesOptions.Destination.ToAddresses = [options.to];
            emailHelper.send(options)
            .then(() => {
                assert(SESMock.prototype.sendEmail.calledWith(sesOptions));
                done();
            });
        });
        it('should pass the provided text message', (done) => {
            options.message = 'test subject';
            sesOptions.Message.Body.Text.Data = options.message;
            emailHelper.send(options)
            .then(() => {
                assert(SESMock.prototype.sendEmail.calledWith(sesOptions));
                done();
            });
        });
    });

    describe('#sendTemplate', () => {
        let options;
        let sesOptions;
        beforeEach(() => {
            options = {
                from: 'from',
                to: 'to',
                subject: 'subject',
                message: 'message',
            };
            sesOptions = {
                Template: 'templatename',
                Source: options.from,
                Destination: { ToAddresses: [options.to] },
                TemplateData: JSON.stringify('templatedata'),
            };
        });

        it('should reject if a required field is missing', (done) => {
            options.to = null;
            emailHelper.sendTemplate(options).catch(() => {
                done();
            });
        });

        it('should automatically set the default from address if it isn\'t provided', (done) => {
            options.from = null;
            sesOptions.Source = 'no-reply@watchmerchantuk.com';
            emailHelper.sendTemplate(options, 'templatename', 'templatedata')
            .then(() => {
                assert(SESMock.prototype.sendTemplatedEmail.calledWith(sesOptions));
                done();
            });
        });

        it('should pass the provided from address if it is provided', (done) => {
            options.from = 'test@emailaddress.com';
            sesOptions.Source = options.from;
            emailHelper.sendTemplate(options, 'templatename', 'templatedata')
            .then(() => {
                assert(SESMock.prototype.sendTemplatedEmail.calledWith(sesOptions));
                done();
            });
        });

        it('should pass the provided recipient address', (done) => {
            options.to = 'test@emailaddress.com';
            sesOptions.Destination.ToAddresses = [options.to];
            emailHelper.sendTemplate(options, 'templatename', 'templatedata')
            .then(() => {
                assert(SESMock.prototype.sendTemplatedEmail.calledWith(sesOptions));
                done();
            });
        });

        it('should specify the given template', (done) => {
            sesOptions.Template = 'anothertemplatename';
            emailHelper.sendTemplate(options, 'anothertemplatename', 'templatedata')
            .then(() => {
                assert(SESMock.prototype.sendTemplatedEmail.calledWith(sesOptions));
                done();
            });
        });

        it('should reject if no recipient address is provided', (done) => {
            options.to = null;
            emailHelper.sendTemplate(options, 'templatename', 'templatedata')
            .catch(() => {
                done();
            });
        });

        it('should reject if a required field for a given template is missing', (done) => {
            emailHelper.sendTemplate(options, 'basicWithHeader', {
                'name': 'bob',
            })
            .catch(() => {
                done();
            });
        });

        it('should reject if the sendTemplatedEmail call returns an error', (done) => {
            SESMock.prototype.sendTemplatedEmail.yields('error');
            emailHelper.sendTemplate(options, 'templatename', 'templatedata')
            .catch(() => {
                done();
            });
        });
    });
});
