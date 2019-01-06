const assert = require('assert');
const sinon = require('sinon');
const AdvertController = require('../../../src/controllers/advert.controller');

describe('#controllers/advertController', () => {
    let sandbox;
    let advertController;
    let mockApp;
    let mockRequest;
    let mockResponse;
    let mockNext = sinon.stub();

    beforeEach(() => {
        sandbox = sinon.sandbox.create();
        mockApp = {
            get: sandbox.stub(),
            getWithApi: sandbox.stub(),
        };
        advertController = new AdvertController(mockApp);
        advertController.Advert = {
            findOne: sandbox.stub(),
        };
        mockRequest = {
            params: {},
            data: {},
        };
        mockResponse = {
            sendStatus: sandbox.stub(),
            render: sandbox.stub(),
        };
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('#getAdvert', () => {
        it('should find the advert based on the ID, make and model passed from the URL');
        context('if an advert is found', () => {
            it('should attach it to the request object', async () => {
                mockRequest.params = {
                    make: 'rolex',
                    model: 'submariner',
                    id: 4,
                };
                advertController.Advert.findOne.resolves({ get: sandbox.stub().returns('123') });
                await advertController.getAdvert(mockRequest, mockResponse, mockNext);
                assert(mockRequest.data.advert);
            });
            it('should call next', async () => {
                mockRequest.params = {
                    make: 'rolex',
                    model: 'submariner',
                    id: 4,
                };
                advertController.Advert.findOne.resolves({ get: sandbox.stub().returns('123') });
                await advertController.getAdvert(mockRequest, mockResponse, mockNext);
                assert(mockNext.called);
            });
        });
        context('if an advert is not found', () => {
            it('should return a 404', async () => {
                mockRequest.params = {
                    make: 'rolex',
                    model: 'submariner',
                    id: 4,
                };
                advertController.Advert.findOne.resolves();
                await advertController.getAdvert(mockRequest, mockResponse, mockNext);
                assert(mockResponse.sendStatus.calledWith(404));
            });
        });
        context('if an error occurs in the database lookup', () => {
            it('should return a 500', async () => {
                mockRequest.params = {
                    make: 'rolex',
                    model: 'submariner',
                    id: 4,
                };
                try {
                    advertController.Advert.findOne.rejects();
                    await advertController.getAdvert(mockRequest, mockResponse, mockNext);
                } catch (error) {
                    assert(mockResponse.sendStatus.calledWith(404));
                }
            });
        });
    });

    describe('#renderAdvert', () => {
        it('should render the advert view', () => {
            advertController.renderAdvert(mockRequest, mockResponse, mockNext);
            assert(mockResponse.render.calledWith('advert'));
        });
    });
});
