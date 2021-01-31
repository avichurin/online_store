let {Model, ModelManager} = require("../app/model");
let ObjectID = require('mongodb').ObjectID;
let tempstor = require("estorm-tempstor");

/**
 * CREATE NEW MODEL
 */
module.exports.create = function (req, res, callback) {
    ModelManager.create(new Model(tempstor.get(req, ModelManager.ENTITY)), callback);
};

/**
 * DELETE EXIST MODEL
 */
module.exports.delete = function (req, res, callback) {
    ModelManager.remove(new Model(tempstor.get(req, ModelManager.ENTITY)), callback);
};

module.exports.deleteList = function (req, res, callback) {
    ModelManager.removeList(new Model(tempstor.get(req, ModelManager.ENTITY)), callback);
};

/**
 * UPDATE EXIST MODEL
 */
module.exports.update = function (req, res, callback) {
    ModelManager.update(new Model(tempstor.get(req, ModelManager.ENTITY)), callback);
};

/**
 * GET LIST OF EXIST MODEL
 */
module.exports.list = function (req, res, callback) {
    ModelManager.list({}, callback);
};

module.exports.listByFirm = function (req, res, callback) {
    ModelManager.listByFirm(new Model(tempstor.get(req, ModelManager.ENTITY)), callback);
};

module.exports.listByFirmForward = function (modelObj, callback) {
    ModelManager.listByFirm(new Model(modelObj), callback);
};

/**
 * GET CERTAIN MODEL BY ID
 */
module.exports.info = function (req, res, callback) {
    ModelManager.info(new Model(tempstor.get(req, ModelManager.ENTITY)), callback);
};

/**
 * GET CERTAIN MODEL BY ALIAS
 */
module.exports.get = function (req, res, callback) {
    ModelManager.get(new Model(tempstor.get(req, ModelManager.ENTITY)), callback);
};
