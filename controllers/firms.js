let {Firm, FirmManager} = require("../app/firm");
let ObjectID = require('mongodb').ObjectID;
let tempstor = require("estorm-tempstor");

/**
 * CREATE NEW FIRM
 */
module.exports.create = function (req, res, callback) {
    let image = null;
    let firm = tempstor.get(req, FirmManager.ENTITY);
    if (firm.file) {
        let data = firm.file.replace(/^data:image\/\w+;base64,/, "");
        image = {buf: new Buffer(data, 'base64'), ext: ".png"};
    }
    FirmManager.create(image, new Firm(tempstor.get(req, FirmManager.ENTITY)), callback);
};

/**
 * DELETE EXIST FIRM
 */
module.exports.delete = function (req, res, callback) {
    FirmManager.remove(new Firm(tempstor.get(req, FirmManager.ENTITY)), callback);
};

/**
 * UPDATE EXIST FIRM
 */
module.exports.update = function (req, res, callback) {
    let image = null;
    let firm = tempstor.get(req, FirmManager.ENTITY);
    if (firm.file) {
        let data = firm.file.replace(/^data:image\/\w+;base64,/, "");
        image = {buf: new Buffer(data, 'base64'), ext: ".png"};
    }
    FirmManager.update(image, new Firm(tempstor.get(req, FirmManager.ENTITY)), callback);
};

/**
 * GET LIST OF EXIST FIRM
 */
module.exports.list = function (req, res, callback) {
    FirmManager.list({}, callback);
};

/**
 * GET CERTAIN FIRM BY ID
 */
module.exports.info = function (req, res, callback) {
    FirmManager.info(new Firm(tempstor.get(req, FirmManager.ENTITY)), callback);
};

/**
 * GET CERTAIN FIRM BY ALIAS
 */
module.exports.get = function (req, res, callback) {
    FirmManager.get(new Firm(tempstor.get(req, FirmManager.ENTITY)), callback);
};
