const _ = require('lodash');
const async = require('async');
const AWS = require('aws-sdk');
const http = require('http');
const https = require('https');
const md5 = require('md5');
const nconf = require('nconf');
const parse = require('csv-parse');
const Stream = require('stream').Transform;
const URL = require('url');
const uuid = require('uuid');

const AuthHelper = require('../utils/authentication');
const BaseController = require('./base.controller');
const Models = require('../models/');

class ImportController extends BaseController {
    constructor(app) {
        super(app);
        this.SQS = new AWS.SQS();
        this.S3 = new AWS.S3();
        this.Advert = Models.adverts;
        this.Images = Models.advertImages;
        this.Brand = Models.brands;
        this.Import = Models.imports;
        this.Product = Models.products;
        this.User = Models.users;

        this.sqsParams = {
            QueueUrl: nconf.get('advertImportQueueUrl'),
            WaitTimeSeconds: 20,
        };

        this.csvFieldMaps = {
            product: {
                'make': 'Make',
                'model': 'Model',
                'manufacturerRef': 'Model Number',
                'year': 'Year',
                'gender': 'Gender',
                'caseMaterial': 'Case Material',
                'caseDiameter': 'Case Diameter mm',
                'dialColour': 'Dial Colour',
                'strap': 'Strap Material',
                'movement': 'Movement',
            },
            advert: {
                'price': 'Price GBP',
                'isNew': 'New',
                'box': 'Box',
                'papers': 'Papers',
                'condition': 'Condition Rating',
                'serviced': 'Serviced',
                'warranty': 'Warranty months',
                'finance': 'Finance',
                'description': 'Description',
                'gemstones': 'Gemstones',
                'imageUrls': 'Image URLs',
            },
        };

        if (nconf.get('advertImportQueueUrl')) {
            this.setup();
        }
    }

    route() {
        this.app.postWithApi(
            '/import/create',
            AuthHelper.requireLoggedInUser,
            this.confirmSellerId.bind(this),
            this.handleFileUpload.bind(this),
            this.createImportEvent.bind(this),
            this.pushFileToS3.bind(this)
        );

        this.app.getWithApi(
            '/import/statuses',
            AuthHelper.requireLoggedInUser,
            this.getImportsBelongingToSeller.bind(this)
        )
    }

    getImportsBelongingToSeller(request, response, next) {
        this.Import.findOne({
            where: {
                seller: request.user.id
            },
        })
        .then(i => {
            return response.status(200).send(i);
        });
    }

    confirmSellerId(request, response, next) {
        if (!request.user || (!request.user.tradeSeller && !request.user.admin)) {
            return response.sendStatus(401);
        }
        request.sellerId = request.user.admin ? request.body.sellerId : request.user.id;
        next();
    }

    handleFileUpload(request, response, next) {
        if (!_.get(request, 'files.advertImport')) {
            return response.sendStatus(400);
        }
        next();
    }

    createImportEvent(request, response, next) {
        return this.Import.create({
            uploaderId: request.user.id,
            sellerId: request.sellerId,
        })
        .then((i) => {
            request.import = i;
            next();
        })
        .catch((e) => {
            return response.sendStatus(500);
        });
    }

    pushFileToS3(request, response, next) {
        const s3Opts = {
            Bucket: nconf.get('advertImportBucket'),
            Key: request.import.uuid + '.csv',
            Body: request.files.advertImport.data,
        };
        this.S3.putObject(s3Opts, (error, data) => {
            if (error) {
                console.error(error);
                return response.sendStatus(500);
            }
            console.log(`Import CSV successfully uploaded.`);
            console.log(data);
            return response.json({ importId: request.import.uuid });
        });
    }

    setup() {
        const checkMs = 5000;
        console.log('Checking SQS import queue every', checkMs, 'milliseconds');
        setInterval(this.checkQueue.bind(this), checkMs);
    }

    checkQueue() {
        this.SQS.receiveMessage(this.sqsParams, (error, data) => {
            if (error) {
                console.error(error);
            }
            if (data.Messages && data.Messages.length) {
                async.eachLimit(data.Messages, 10, (message, done) => {
                    const body = JSON.parse(message.Body);
                    if (body.Records) {
                        body.Records.forEach((record) => {
                            if (record.eventSource === 'aws:s3') {
                                if (record.s3) {
                                    this.processFileDrop({ drop: record.s3, messageId: message.ReceiptHandle });
                                }
                            }
                        });
                    }
                    done();
                });
            }
        });
    }

    processFileDrop(data) {
        const bucketName = data.drop.bucket.name;
        const file = data.drop.object.key;
        return this.findImportRecord(file)
            .then((i) => {
                console.log('Processing import', i.uuid);
                this.retrieveFile({ import: i, bucket: bucketName, key: file, messageId: data.messageId });
            })
            .catch((error) => {
                console.log(`Found ${file} but cannot match it to an import; removing`);
                this.removeMessage(data.messageId);
            });
    }

    findImportRecord(file) {
        return new Promise((resolve, reject) => {
            this.Import.findOne({
                where: {
                    uuid: file.split('.csv')[0],
                    reconciled: false,
                },
            })
            .then((i) => {
                if (i) {
                    return resolve(i);
                } else {
                    return reject();
                }
            });
        });
    }

    retrieveFile(data) {
        return new Promise((resolve, reject) => {
            this.S3.getObject({
                Bucket: data.bucket,
                Key: data.key,
            }, (error, csvData) => {
                if (error) {
                    console.error(error);
                    reject(error);
                } else {
                    data.csv = csvData.Body.toString();
                    this.parseCSVData(data);
                    resolve();
                }
            });
        });
    }

    removeMessage(handle) {
        console.log('Deleting message', handle);
        this.SQS.deleteMessage({ QueueUrl: this.sqsParams.QueueUrl, ReceiptHandle: handle }, (error) => {
            if (error) {
                console.error(error);
            }
        });
    }

    parseCSVData(data) {
        const parser = parse(data.csv, { columns: true });
        return new Promise((resolve, reject) => {
            let rowCount = 0;
            parser.on('readable', () => {
                const record = parser.read();
                if (record) {
                    data.record = record;
                    this.processAdvert(data);
                    rowCount++;
                }
            });
            parser.on('finish', () => {
                parser.end();
                data.import.update({
                    adverts: rowCount,
                })
                .then(resolve);
                this.reconcileImport(data);
            });
        });
    }

    processAdvert(data) {
        const ad = data.record;
        let productData = {};
        Object.keys(this.csvFieldMaps.product).forEach((dbField) => {
            productData[dbField] = ad[this.csvFieldMaps.product[dbField]];
        });
        let advertData = {};
        Object.keys(this.csvFieldMaps.advert).forEach((dbField) => {
            advertData[dbField] = ad[this.csvFieldMaps.advert[dbField]];
        });

        this.findOrCreateProductData(productData, data.import.id)
        .then(async (product) => {
            advertData.productId = product.id;
            advertData.md5 = md5(JSON.stringify(advertData));
            advertData.importId = data.import.id;
            advertData.sellerId = data.import.sellerId;
            const sanitisedAdvertData = this.sanitiseAdvertData(advertData);
            const advert = await this.Advert.create(
                _.omit(sanitisedAdvertData, 'imageUrls'),
                {
                    include: [{ model: this.Images, as: 'images' }],
                }
            );
            let imageUrls = _.map(advertData.imageUrls.split(','), (imageUrl) => {
                return URL.parse(imageUrl);
            });
            imageUrls = _.filter(imageUrls, (imageUrl) => {
                return !!imageUrl.hostname;
            });
            this.retrieveAndAttachImages(imageUrls, advert)
            .catch((error) => {
                console.error(error);
            });
        });
    }

    retrieveAndAttachImages(urls, advert) {
        return new Promise((resolve, reject) => {
            async.eachLimit(urls, 5, (url, done) => {
                let client = http;
                if (url.protocol === 'https:') {
                    client = https;
                }
                client.get(url, async (response) => {
                    if (response.statusCode !== 200) {
                        console.log(`URL ${url} returned code ${response.statusCode} - not ingesting`);
                        return done();
                    }
                    let body = new Stream();
                    response.on('data', (chunk) => {
                        body.push(chunk);
                    });
                    response.on('end', async () => {
                        const ext = /(?:jpg)|(?:png)|(?:gif)/i.exec(url.path);
                        if (!ext || !ext.length) {
                            console.log(`URL contains no valid extension - ${url.path}`);
                            return done();
                        }
                        // const tmpfile = tmp.fileSync();
                        // fs.writeFileSync(tmpfile, data.read());
                        const s3Url = `${uuid.v4()}.${ext[0]}`;
                        console.log(s3Url);
                        await this.Images.create({
                            url: s3Url,
                            advertId: advert.id,
                        });
                        this.S3.putObject(
                            {
                                Bucket: nconf.get('advertImageUploadBucket'),
                                Key: `watches/${s3Url}`,
                                Body: body.read(),
                                ACL: 'public-read',
                                ContentType: `image/${ext[0]}`,
                            }, (error, data) => {
                                if (error) {
                                    return done(error);
                                }
                                return done();
                            });
                    });
                }, (error) => {
                    if (error) {
                        return reject(error);
                    } else {
                        return resolve();
                    }
                });
            });
        });
    }

    reconcileImport(data) {
        data.import.update({
            reconciled: true,
        })
        .then(() => {
            console.log(`Import ${data.import.uuid} reconciled.`);
            this.removeMessage(data.messageId);
        });
    }

    findOrCreateProductData(productData, importId) {
        return new Promise((resolve, reject) => {
            const brandName = productData.make;
            console.log('Finding or creating brand', brandName);
            this.Brand.findOrCreate({
                where: {
                    name: _.capitalize(brandName),
                },
                defaults: {
                    importId: importId,
                },
            })
            .spread((brand, newBrand) => {
                if (newBrand) {
                    console.log(`New brand ${brand.friendlyName} created`);
                }
                const sanitisedProductData = this.sanitiseProductData(productData);
                console.log(sanitisedProductData);
                this.Product.findOrCreate({
                    where: _.omit(sanitisedProductData, 'make'),
                    defaults: {
                        importId: importId,
                        brandId: brand.id,
                    },
                })
                .spread((product, newProduct) => {
                    if (newProduct) {
                        console.log(`New product ${brand.friendlyName} ${product.model} created`);
                    }
                    return resolve(product.get({ plain: true }));
                });
            });
        });
    }

    sanitiseProductData(productData) {
        if (productData.gender.toLowerCase() === 'mens') {
            productData.gender = 'male';
        } else if (productData.gender.toLowerCase() === 'ladies') {
            productData.gender = 'female';
        }
        Object.keys(productData).forEach((key) => {
            if (productData.hasOwnProperty(key)) {
                if (productData[key] === '') {
                    delete productData[key];
                }
            }
        });
        return productData;
    }

    sanitiseAdvertData(advertData) {
        ['isNew', 'box', 'gemstones', 'papers', 'serviced', 'finance'].forEach((key) => {
            if (!advertData[key]) return;
            advertData[key] = advertData[key].toLowerCase() === 'yes' ? true : false;
        });
        for (let key in Object.keys(advertData)) {
            if (advertData.hasOwnProperty(key)) {
                if (advertData[key] === '') {
                    delete advertData[key];
                }
            }
        }
        return advertData;
    }
}

module.exports = ImportController;
