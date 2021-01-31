let {Sneakers, SneakersManager} = require("../app/sneakers");
let ObjectID = require('mongodb').ObjectID;
let tempstor = require("estorm-tempstor");

/**
 * CREATE NEW SNEAKERS
 */
module.exports.create = function (req, res, callback) {
    SneakersManager.create(new Sneakers(tempstor.get(req, SneakersManager.ENTITY)), callback);
};

/**
 * DELETE EXIST SNEAKERS
 */
module.exports.delete = function (req, res, callback) {
    SneakersManager.remove(new Sneakers(tempstor.get(req, SneakersManager.ENTITY)), callback);
};

module.exports.deleteByModel = function (req, res, callback) {
    SneakersManager.removeByModel(new Sneakers(tempstor.get(req, SneakersManager.ENTITY)), callback);
};

module.exports.deleteByModelList = function (models, callback) {
    SneakersManager.removeByModelList(models, callback);
};

/**
 * UPDATE EXIST SNEAKERS
 */
module.exports.update = function (req, res, callback) {
    SneakersManager.update(new Sneakers(tempstor.get(req, SneakersManager.ENTITY)), callback);
};

/**
 * GET LIST OF EXIST SNEAKERS
 */
module.exports.list = function (req, res, callback) {
    SneakersManager.list({}, callback);
};

module.exports.listByModel = function (req, res, callback) {
    SneakersManager.listByModel(new Sneakers(tempstor.get(req, SneakersManager.ENTITY)), callback);
};

module.exports.listByModelForward = function (sneakersObj, callback) {
    SneakersManager.listByModel(new Sneakers(sneakersObj), callback);
};

/**
 * GET CERTAIN SNEAKERS BY ID
 */
module.exports.info = function (req, res, callback) {
    SneakersManager.info(new Sneakers(tempstor.get(req, SneakersManager.ENTITY)), callback);
};

/**
 * GET CERTAIN SNEAKERS BY ALIAS
 */
module.exports.get = function (req, res, callback) {
    SneakersManager.get(new Sneakers(tempstor.get(req, SneakersManager.ENTITY)), callback);
};
