const assert = require('assert');
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const UserController = proxyquire('../../../src/controllers/user.controller', {
    '../helpers/email': {
        send: sinon.stub(),
    },
});

describe('#controllers/userController', () => {
    let userController;
    let mockRequest;
    let mockResponse;
    let mockNext;
    let mockApp;
    let mockDb;

    beforeEach(() => {
        mockRequest = {
            body: {},
        };
        mockResponse = {
            render: sinon.stub(),
            renderHtml: sinon.stub(),
            sendStatus: sinon.stub(),
            redirect: sinon.stub(),
        };
        mockNext = sinon.stub();
        mockApp = {
            get: sinon.stub(),
            post: sinon.stub(),
            getWithApi: sinon.stub(),
            postWithApi: sinon.stub(),
        };
        mockDb = {
            import: () => {
                return {
                    findOne: sinon.stub(),
                };
            },
        };
        userController = new UserController(mockApp, mockDb);
        userController.User = {
            findOne: sinon.stub(),
            create: sinon.stub(),
            generateHash: sinon.stub().returns('hashed password'),
        };
        userController.emailHelper = {
            send: sinon.stub().resolves(),
            sendTemplate: sinon.stub().resolves(),
        };
    });

    describe('#renderRegistrationPage', () => {
        it('should render the registration view', () => {
            userController.renderRegistrationPage(mockRequest, mockResponse, mockNext);
            assert(mockResponse.render.calledWith('user/register'));
        });
    });

    describe('#ensureUserDoesNotExist', () => {
        it('should query the user table for a user matching the e-mail address provided', () => {
            mockRequest.body.email = 'test@email.com';
            userController.User.findOne.resolves();
            userController.ensureUserDoesNotExist(mockRequest, mockResponse, mockNext);
            assert(userController.User.findOne.calledWith({ where: { email: mockRequest.body.email } }));
        });

        it('should return a 403 if a matching user is found', (done) => {
            mockRequest.body.email = 'test@email.com';
            userController.User.findOne.resolves(true);
            userController.ensureUserDoesNotExist(mockRequest, mockResponse, mockNext).then(() => {
                assert(mockResponse.sendStatus.calledWith(403));
                done();
            });
        });

        it('should call next if no such user is found', (done) => {
            mockRequest.body.email = 'test@email.com';
            userController.User.findOne.resolves();
            userController.ensureUserDoesNotExist(mockRequest, mockResponse, mockNext).then(() => {
                assert(mockNext.called);
                done();
            });
        });
    });

    describe('#validateUser', () => {
        it('should return 400 if email is not provided', () => {
            mockRequest.body = {
                password: 'some-password',
            };
            userController.validateUser(mockRequest, mockResponse, mockNext);
            assert(mockResponse.sendStatus.calledWith(400));
        });

        it('should call next if the email address, password, first name and surname are provided', () => {
            mockRequest.body = {
                email: 'abc@def.com',
                password: 'password',
                firstName: 'bob',
                surname: 'bloggs',
            };
            userController.validateUser(mockRequest, mockResponse, mockNext);
            assert(mockNext.called);
        });
    });

    describe('#createUser', () => {
        beforeEach(() => {
            mockRequest.body = {
                email: 'abc@def.com',
                password: 'password',
                firstName: 'bob',
                surname: 'bloggs',
                phoneNumber: null,
            };
        });

        it('should call create with the e-mail address and password hash and newsletter true', () => {
            userController.User.generateHash = sinon.stub().returns('hashed password');
            userController.createUser(mockRequest, mockResponse, mockNext);
            assert(userController.User.create.calledWith({
                email: mockRequest.body.email,
                password: 'hashed password',
                firstName: 'bob',
                surname: 'bloggs',
                phoneNumber: null,
                newsletter: true,
            }));
        });

        it('should generate a password hash from the supplied password', () => {
            mockRequest.body.password = 'a password';
            userController.createUser(mockRequest, mockResponse, mockNext);
            assert(userController.User.generateHash.calledWith(mockRequest.body.password));
        });


        it('should render the completed registration page', () => {
            userController.createUser(mockRequest, mockResponse, mockNext);
            assert(mockResponse.renderHtml.calledWith('user/registered'));
        });
    });

    describe('#validateUserLoggedIn', () => {
        it('should redirect to the login page if no user is attached to the request object', () => {
            userController.validateUserLoggedIn(mockRequest, mockResponse, mockNext);
            assert(mockResponse.redirect.calledWith('/user/login'));
        });

        it('should call next if a user is found on the request object', () => {
            mockRequest.user = { id: 1 };
            userController.validateUserLoggedIn(mockRequest, mockResponse, mockNext);
            assert(mockNext.called);
        });
    });
});
