let express = require('express');
let router = express.Router();
let sneakersController = require("../controllers/sneakers");
let modelsController = require("../controllers/models");
let firmsController = require("../controllers/firms");
let ordersController = require("../controllers/orders");

const {FirmManager} = require("../app/firm");
const {ModelManager} = require("../app/model");
const {SneakersManager} = require("../app/sneakers");
const {OrdersManager} = require("../app/orders");
let tempstor = require("estorm-tempstor");

let async = require("async");

let jimp = require("jimp");
let readDirFiles = require('read-dir-files');

// GET home page
router.get('/', function (req, res, next) {

    getGloabalFirms(req, res, 5, 4, 1, false, function (err, firms) {
        if (err) {
            next(err);
        } else {
            let view = "main";
            let layout = "sneakers";

            if(req.device.type === "phone" || req.device.type === "tablet") {
                view += "_mob";
                layout += '_mob';
            }

            res.render('pages/sneakers/' + view, {
                layout: "layouts/" + layout,
                title: 'Sneakers Customs',
                firms: firms
            });
        }
    });
});


// GET minify images
router.get('/minify', function (req, res, next) {

    //let side = 100;
    let side = 200;

    readDirFiles.list('resources/sneakers/images', function (err, filenames) {
        if (err) return console.dir(err);

        async.map(filenames, function (path, cb) {
            jimp.read(path, function (err, res) {
                if (err) return cb(null);

                let width, height;
                if(res["_exif"]){
                    if(res["_exif"].imageSize.width < res["_exif"].imageSize.height){
                        width = side;
                        height = jimp.AUTO;
                    } else {
                        width = jimp.AUTO;
                        height = side;
                    }
                } else {
                    width = side;
                    height = jimp.AUTO;
                }

                let newPath = path.split("sneakers");
                res.resize(width, height)
                    .quality(60)
                    .write(newPath[0] + "sneakers_small" + newPath[1]);

                cb(null);
            });
        }, function (err) {
            res.json({ok: 1});
        });
    });
});

// GET successful page
router.get('/success', function (req, res, next) {
    res.render('pages/sneakers/success', {layout: "layouts/sneakers", title: 'Successful order'});
});

function getGloabalFirms(req, res, firmsCount, modelsPerFirmCount, sneakersPerModelCount, random, cbGlobal) {
    firmsController.list(req, res, function (err, firmsList) {
        async.map(firmsList, function (firm, cbFirm) {

            let modelObj = {firm_id: firm.getId() + ""};
            modelsController.listByFirmForward(modelObj, function (err, modelsList) {
                async.map(modelsList, function (model, cbModel) {

                    let sneakersObj = {model_id: model.getId() + ""};
                    sneakersController.listByModelForward(sneakersObj, function (err, sneakersList) {
                        model.setSneakers(sneakersList);
                        cbModel(null, model);
                    });

                }, function (err, models) {
                    if (err) {
                        cbFirm(err);
                    } else {
                        firm.setModels(models);
                        cbFirm(null, firm);
                    }
                });
            });


        }, function (err, firms) {
            if (err) {
                cbGlobal(err);
            } else {

                if (random) {
                    firms.sort(function () {
                        return .5 - Math.random();
                    });
                } else {
                    firms.sort(function (a, b) {
                        if (a.priority < b.priority)
                            return 1;
                        if (a.priority > b.priority)
                            return -1;
                        return 0;
                    });
                }


                let realFirms = firms.splice(0, firmsCount);

                async.map(realFirms, function (firm, cb) {
                    firm.prepareModels(modelsPerFirmCount, sneakersPerModelCount, random, cb);
                }, function (err) {
                    if (err) {
                        cbGlobal(err);
                    } else {
                        cbGlobal(null, realFirms);
                    }
                });

            }
        });
    });
}

// GET current sneakers
router.get('/firm/:firm_id/model/:model_id/sneakers/:sneakers_alias', function (req, res, next) {

    tempstor.set(req, FirmManager.ENTITY, {id: req.params.firm_id});
    tempstor.set(req, ModelManager.ENTITY, {id: req.params.model_id});
    tempstor.set(req, SneakersManager.ENTITY, req.params);

    firmsController.info(req, res, function (err, firm) {
        if (err) {
            next(err);
        } else {
            modelsController.info(req, res, function (err, model) {
                if (err) {
                    next(err);
                } else {
                    firm.setModels([model]);
                    sneakersController.listByModel(req, res, function (err, sneakersList) {
                        model.setSneakers(sneakersList);


                        let globalFirms = 4;
                        let globalModels = 2;
                        let globalSneakers = 1;
                        let modelSamples = 7;

                        if(req.device.type === "phone" || req.device.type === "tablet") {
                            globalModels = 4;
                            globalSneakers = 1;
                            modelSamples = 12;
                        }

                        getGloabalFirms(req, res, globalFirms, globalModels, globalSneakers, true, function (err, firms) {
                            if (err) {
                                next(err);
                            } else {

                                let sneakers = tempstor.get(req, SneakersManager.ENTITY);

                                firm.prepareModels(1, modelSamples, true, function () {

                                    let currentSneakers = firm.getModels()[0].getSneakersByAlias(sneakers.sneakers_alias);
                                    let preparedModel = firm.getModels()[0];
                                    preparedModel.addSneakersToStart(currentSneakers);

                                    let view = "product";
                                    let layout = "sneakers";

                                    if(req.device.type === "phone" || req.device.type === "tablet") {
                                        view += "_mob";
                                        layout += '_mob';
                                    }

                                    res.render('pages/sneakers/' + view, {
                                        layout: "layouts/" + layout,
                                        title: 'Sneaker custom ' + model.getAlias(),
                                        firm: firm,
                                        model: preparedModel,
                                        sneakers: currentSneakers,
                                        firms: firms
                                    });
                                });
                            }
                        });
                    });
                }
            });
        }
    });
});

// GET current sneakers
router.post('/order', function (req, res, next) {

    tempstor.set(req, OrdersManager.ENTITY, {data: req.body});

    ordersController.create(req, res, function (err) {
        if (err) {
            next(err);
        } else {
            res.json({ok: 1});
        }
    });
});

router.get('/firm/:firm_id', function (req, res, next) {

    tempstor.set(req, FirmManager.ENTITY, {id: req.params.firm_id});
    tempstor.set(req, ModelManager.ENTITY, req.params);
    tempstor.set(req, SneakersManager.ENTITY, req.params);

    firmsController.info(req, res, function (err, firm) {
        if (err) {
            next(err);
        } else {
            modelsController.listByFirm(req, res, function (err, models) {
                if (err) {
                    next(err);
                } else {

                    async.map(models, function (model, cbModel) {

                        let sneakersObj = {model_id: model.getId() + ""};
                        sneakersController.listByModelForward(sneakersObj, function (err, sneakersList) {
                            sneakersList.sort(function () {
                                return .5 - Math.random();
                            });
                            model.setSneakers(sneakersList);
                            cbModel(null, model);
                        });

                    }, function (err, models) {
                        if (err) {
                            cbFirm(err);
                        } else {

                            models.sort(function () {
                                return .5 - Math.random();
                            });

                            firm.setModels(models);

                            getGloabalFirms(req, res, 4, 2, 1, true, function (err, firms) {
                                if (err) {
                                    next(err);
                                } else {

                                    let sneakers = tempstor.get(req, SneakersManager.ENTITY);

                                    firm.prepareModels(1, 8, true, function () {
                                        switch (req.device.type) {
                                            case "desktop":
                                                res.render('pages/sneakers/product', {
                                                    layout: "layouts/sneakers",
                                                    title: 'Sneaker custom ' + firm.getModels()[0].getAlias(),
                                                    firm: firm,
                                                    model: firm.getModels()[0],
                                                    sneakers: firm.getModels()[0].getSneakersFromAll()[0],
                                                    firms: firms
                                                });
                                                break;
                                            case "phone":
                                                res.render('pages/sneakers/product_mob', {
                                                    layout: "layouts/sneakers_mob",
                                                    title: 'Sneaker custom ' + firm.getModels()[0].getAlias(),
                                                    firm: firm,
                                                    model: firm.getModels()[0],
                                                    sneakers: firm.getModels()[0].getSneakersFromAll()[0],
                                                    firms: firms
                                                });
                                                break;
                                        }
                                    });
                                }
                            });
                        }
                    });

                }
            });
        }
    });

});

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

module.exports = router;
