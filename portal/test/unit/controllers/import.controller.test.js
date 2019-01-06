const assert = require('assert');
const proxyquire = require('proxyquire');
const sinon = require('sinon');

const AWSMock = {
    S3: function() {
        return {
            putObject: sinon.stub(),
            getObject: sinon.stub(),
        };
    },
    SQS: function() {
        return {
            receiveMessage: sinon.stub(),
            deleteMessage: sinon.stub(),
        };
    },
};

const nconfMock = {
    get: sinon.stub(),
};

const parseMock = sinon.stub().returns({
    on: sinon.stub().yields(),
    read: sinon.stub().returns('something'),
    end: sinon.stub(),
});

const ImportController = proxyquire(
    '../../../src/controllers/import.controller',
    {
        'aws-sdk': AWSMock,
        'nconf': nconfMock,
        'csv-parse': parseMock,
    }
);

describe('#controllers/importController', () => {
    let importController;
    let mockApp;
    let mockRequest;
    let mockResponse;
    let mockNext;

    beforeEach(() => {
        mockApp = {
            post: sinon.stub(),
            postWithApi: sinon.stub(),
        };
        importController = new ImportController(mockApp);
        importController.Advert = {
            findOrCreate: sinon.stub(),
        };
        importController.Brand = {
            findOrCreate: sinon.stub(),
        };
        importController.Import = {
            create: sinon.stub(),
            findOne: sinon.stub(),
        };
        importController.Product = {
            findOrCreate: sinon.stub(),
        };
        importController.User = {
            findOrCreate: sinon.stub(),
        };
        mockRequest = {
            body: {},
            files: {},
            import: {},
        };
        mockResponse = {
            sendStatus: sinon.stub(),
            json: sinon.stub(),
        };
        mockNext = sinon.stub();
    });

    describe('#confirmSellerId', () => {
        context('should return a 401 if', () => {
            it('no user is logged in', () => {
                importController.confirmSellerId(mockRequest, mockResponse, mockNext);
                assert(mockResponse.sendStatus.calledWith(401));
            });
            it('a user is logged in but neither an admin nor a trade seller', () => {
                mockRequest.user = {
                    name: 'joey joe joe junior',
                    tradeSeller: false,
                    admin: false,
                };
                importController.confirmSellerId(mockRequest, mockResponse, mockNext);
                assert(mockResponse.sendStatus.calledWith(401));
            });
        });
        context('if a user is logged in', () => {
            context('and is a trade seller', () => {
                it('should call next', () => {
                    mockRequest.user = {
                        tradeSeller: true,
                    };
                    importController.confirmSellerId(mockRequest, mockResponse, mockNext);
                    assert(mockNext.called);
                });
            });
            context('and is an admin', () => {
                it('should call next', () => {
                    mockRequest.user = {
                        admin: true,
                    };
                    importController.confirmSellerId(mockRequest, mockResponse, mockNext);
                    assert(mockNext.called);
                });
            });
        });

        context('if the user is an admin', () => {
            it('should take the sellerId field and attach it to the request', () => {
                mockRequest.body = {
                    sellerId: 10,
                };
                mockRequest.user = {
                    admin: true,
                };
                importController.confirmSellerId(mockRequest, mockResponse, mockNext);
                assert.equal(mockRequest.sellerId, 10);
            });
        });
        context('if the user is a trade seller but not an admin', () => {
            it('should attach the seller\'s own user id to the request', () => {
                mockRequest.body = {
                    sellerId: '123',
                };
                mockRequest.user = {
                    tradeSeller: true,
                    id: 1,
                };
                importController.confirmSellerId(mockRequest, mockResponse, mockNext);
                assert.equal(mockRequest.sellerId, 1);
            });
        });
    });

    describe('#handleFileUpload', () => {
        context('if a file is sent', () => {
            it('should call next', () => {
                mockRequest.files.advertImport = 1;
                importController.handleFileUpload(mockRequest, mockResponse, mockNext);
                assert(mockNext.called);
            });
        });
        context('if no file is sent', () => {
            it('should return a 400', () => {
                importController.handleFileUpload(mockRequest, mockResponse, mockNext);
                assert(mockResponse.sendStatus.calledWith(400));
            });
        });
    });

    describe('#createImportEvent', () => {
        it('should create an Import object with the user object attached as the uploader and the sellerId as the seller to the request', (done) => {
            mockRequest.sellerId = 1;
            mockRequest.user = {
                id: 2,
            };
            importController.Import.create.resolves();
            importController.createImportEvent(mockRequest, mockResponse, mockNext)
            .then(() => {
                assert(importController.Import.create.calledWith({
                    uploaderId: 2,
                    sellerId: 1,
                }));
                done();
            });
        });

        it('should attach the created import event to the request object', async () => {
            mockRequest.sellerId = 1;
            mockRequest.user = {
                id: 2,
            };
            importController.Import.create.resolves({ id: 1 });
            await importController.createImportEvent(mockRequest, mockResponse, mockNext);
            assert(mockRequest.import);
        });

        context('if the database save is successful', () => {
            it('should call next', async () => {
                mockRequest.sellerId = 1;
                mockRequest.user = {
                    id: 2,
                };
                importController.Import.create.resolves();
                await importController.createImportEvent(mockRequest, mockResponse, mockNext);
                assert(mockNext.called);
            });
        });

        context('if the database save fails', () => {
            it('should return a 500', async () => {
                mockRequest = {
                    sellerId: 1,
                    user: { id: 2 },
                };
                importController.Import.create.rejects();
                try {
                    await importController.createImportEvent(mockRequest, mockResponse, mockNext);
                } catch (error) {
                    assert(mockResponse.sendStatus.calledWith(500));
                }
            });
        });
    });

    describe('#pushFiletoS3', () => {
        it('should push the file to S3 using the correct bucket name, file name and file data', () => {
            mockRequest.import = {
                uuid: 'uuid',
            };
            mockRequest.files = {
                advertImport: {
                    data: 'abc',
                },
            };
            nconfMock.get.returns('bucket');
            importController.pushFileToS3(mockRequest, mockResponse, mockNext);
            assert(importController.S3.putObject.calledWith({
                Bucket: 'bucket',
                Key: 'uuid.csv',
                Body: 'abc',
            }));
        });
        context('if S3 returns an error', () => {
            it('should return a 500', () => {
                mockRequest.files = {
                    advertImport: {
                        data: 'abc',
                    },
                };
                importController.S3.putObject.yields('an error');
                importController.pushFileToS3(mockRequest, mockResponse, mockNext);
                assert(mockResponse.sendStatus.calledWith(500));
            });
        });
        context('if S3 returns a success response', () => {
            it('should return a json response containing the import object\'s UUID', () => {
                mockRequest.import = {
                    uuid: 'uuid',
                };
                mockRequest.files = {
                    advertImport: {
                        data: 'abc',
                    },
                };
                nconfMock.get.returns('bucket');
                importController.S3.putObject.yields();
                importController.pushFileToS3(mockRequest, mockResponse, mockNext);
                assert(mockResponse.json.calledWith({
                    importId: 'uuid',
                }));
            });
        });
    });

    describe('#checkQueue', () => {
        it('should check the SQS queue for messages', () => {
            importController.checkQueue();
            assert(importController.SQS.receiveMessage.calledWith(importController.sqsParams));
        });

        context('if there are messages waiting to be read', () => {
            context('if the message source is S3', () => {
                it('should call processFileDrop with the S3 record and message receipt handle', () => {
                    const message = {
                        Body: JSON.stringify({
                            Records: [{
                                eventSource: 'aws:s3',
                                s3: 1,
                            }],
                        }),
                        ReceiptHandle: 'receipt',
                    };
                    const data = { Messages: [message] };
                    importController.SQS.receiveMessage.yields(null, data);
                    importController.processFileDrop = sinon.stub();
                    importController.checkQueue();
                    assert(importController.processFileDrop.calledWith({ drop: 1, messageId: 'receipt' }));
                });
            });
        });
    });

    describe('#processFileDrop', () => {
        beforeEach(() => {
            importController.findImportRecord = sinon.stub();
            importController.retrieveFile = sinon.stub();
            importController.removeMessage = sinon.stub();
        });

        it('should call findImportRecord based on the file name given', () => {
            importController.findImportRecord = sinon.stub().resolves();
            importController.processFileDrop({
                drop: {
                    bucket: {
                        name: 'bucket',
                    },
                    object: {
                        key: 'abc.csv',
                    },
                },
            });
            assert(importController.findImportRecord.calledWith('abc.csv'));
        });
        context('if the import record is found', () => {
            it('should call retrieveFile', async () => {
                importController.findImportRecord.resolves('file');
                await importController.processFileDrop({
                    drop: {
                        bucket: {
                            name: 'bucket',
                        },
                        object: {
                            key: 'abc.csv',
                        },
                    },
                });
                assert(importController.retrieveFile.called);
            });
        });
        context('if the import record is not found', () => {
            it('should call removeMessage', async () => {
                importController.findImportRecord.rejects();
                try {
                    await importController.processFileDrop({
                        drop: {
                            bucket: {
                                name: 'bucket',
                            },
                            object: {
                                key: 'abc.csv',
                            },
                        },
                    });
                } catch (error) {
                    assert(importController.removeMessage.called);
                }
            });
        });
    });

    describe('#findImportRecord', () => {
        it('should search for an import record that is unreconciled and has a uuid matching the file name given (with .csv removed)', () => {
            importController.Import.findOne.resolves('file');
            importController.findImportRecord('file.csv');
            assert(importController.Import.findOne.calledWith({
                where: {
                    uuid: 'file',
                    reconciled: false,
                },
            }));
        });
    });

    describe('#retrieveFile', () => {
        beforeEach(() => {
            importController.parseCSVData = sinon.stub();
        });

        it('should call getObject with the bucket and key name given', async () => {
            importController.S3.getObject.yields(null, { Body: 123 });
            await importController.retrieveFile({ bucket: 'bucket', key: 'key' });
            assert(importController.S3.getObject.calledWith({ Bucket: 'bucket', Key: 'key' }));
        });

        context('if the data is returned', () => {
            it('should convert the data to a string', async () => {
                const toString = sinon.stub();
                importController.S3.getObject.yields(null, { Body: { toString: toString } });
                await importController.retrieveFile({ bucket: 'bucket', key: 'key' });
                assert(toString.called);
            });

            it('should call parseCSVData', async () => {
                importController.S3.getObject.yields(null, { Body: 123 });
                await importController.retrieveFile({ bucket: 'bucket', key: 'key' });
                assert(importController.parseCSVData.called);
            });
        });
    });

    describe('#removeMessage', () => {
        it('should call deleteMessage with the correct QueueUrl and ReceiptHandle', () => {
            importController.sqsParams.QueueUrl = 'abc';
            importController.removeMessage('abc');
            assert(importController.SQS.deleteMessage.calledWith({
                QueueUrl: 'abc',
                ReceiptHandle: 'abc',
            }));
        });
    });

    describe('#parseCSVData', () => {
        beforeEach(() => {
            importController.processAdvert = sinon.stub();
        });

        it('should call parse with { columns: true }', async () => {
            await importController.parseCSVData({
                csv: '123',
                import: {
                    update: sinon.stub().resolves(),
                },
            });
            assert(parseMock.calledWith('123', { columns: true }));
        });
        context('on each row of data', () => {
            it('should call processAdvert', () => {
                let data = {
                    csv: '123',
                    import: {
                        update: sinon.stub().resolves(),
                    },
                };
                importController.parseCSVData(data);
                assert(importController.processAdvert.calledWith(data));
            });
        });
    });

    describe('#processAdvert', () => {
        context('if the product is created or found', () => {
            it('should call sanitiseAdvertData with the correct advert data');
            it('should find or create an advert based on the advert md5');
            context('if the advert creation succeeds', () => {
                it('should call reconcileImport');
            });
        });
    });

    describe('#reconcileImport', () => {
        it('should call update on the passed import object, setting reconciled to true');
        context('if the reconciliation succeeds', () => {
            it('should call removeMessage');
        });
    });

    describe('#findOrCreateProductData', () => {
        context('Brand finding or creation', () => {
            it('should convert the brand name to lower case');
            it('should store the originally passed brand name as is in the friendlyName field');
            it('should slugify the slug');
        });
        it('should call sanitiseProductData on the product data');
        it('should call findOrCreate on the Product model, omitting the make field');
        context('if the product find or creation succeeds', () => {
            it('should resolve with the plain project object passed');
        });
    });

    describe('#sanitiseProductData', () => {
        context('in the gender field', () => {
            it('should convert mens to male', () => {
                const output = importController.sanitiseProductData({ gender: 'mens' });
                assert.equal(output.gender, 'male');
            });
            it('should convert ladies to female', () => {
                const output = importController.sanitiseProductData({ gender: 'ladies' });
                assert.equal(output.gender, 'female');
            });
        });
    });

    describe('#sanitiseAdvertData', () => {
        ['isNew', 'box', 'gemstones', 'papers', 'serviced', 'finance'].forEach((key) => {
            ['yes', 'no'].forEach((answer) => {
                it(`should convert ${answer} to ${answer === 'yes' ? 'true' : 'false'} for ${key}`, () => {
                    const output = importController.sanitiseAdvertData({
                        [key]: answer,
                    });
                    if (answer === 'yes') {
                        assert(output[key] === true);
                    } else {
                        assert(output[key] === false);
                    }
                });
            });
        });
    });
});
