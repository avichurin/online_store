let db = require("estorm-db").get();
let Firm = require("./Firm");
let ObjectID = require('mongodb').ObjectID;
let {ResourceExtension, ResourceLoader, ResourcePack, ResourceType} = require("estorm-resources");
let async = require("async");

const ENTITY = "firm";
const IMAGE_ENTITY = "image";

class FirmManager {

    static get ENTITY() {
        return ENTITY;
    }

    static get IMAGE_ENTITY() {
        return IMAGE_ENTITY;
    }

    static init() {
        db.collection(ENTITY).createIndex({alias: 1}, {unique: true});
    }

    static list(query, callback) {
        db.collection(ENTITY).find(query).toArray(function (err, res) {
            if (err) {
                callback(err);
            } else {
                async.map(res, function (l, cb) {
                    let firm = new Firm(l);
                    FirmManager.loadResourcePack(firm.getId(), function(err, resourcePack){
                        if(!err){
                            firm.setResourcePack(resourcePack);
                        }
                        cb(null, firm);
                    });
                }, function (err, results) {
                    callback(err, results);
                });
            }
        });
    }

    static info(firm, callback) {
        if (ObjectID.isValid(firm.getId())) {
            db.collection(ENTITY).findOne({
                _id: new ObjectID(firm.getId())
            }, function (err, res) {
                if (err || !res) {
                    callback(new Error("Firm not found"));
                } else {
                    let firm = new Firm(res);
                    FirmManager.loadResourcePack(firm.getId(), function(err, resourcePack){
                        if(!err){
                            firm.setResourcePack(resourcePack);
                        }
                        callback(null, firm);
                    });
                }
            });
        } else {
            callback(new Error("Invalid firm's id passed"));
        }
    }

    static get(firm, callback) {
        db.collection(ENTITY).findOne({alias: firm.getAlias()}, function (err, res) {
            if (err || !res) {
                callback(new Error("Firm not found"));
            } else {
                let firm = new Firm(res);
                callback(null, firm);
            }
        });
    }

    static create(image, firm, callback) {
        db.collection(ENTITY).insertOne({
            name: firm.getName(),
            alias: firm.getAlias(),
            photo: firm.getPhoto(),
            priority: firm.getPriority()
        }, function (err, res) {
            if (err) {
                callback(err);
            } else {
                const uid = res.insertedId;
                if (image) {
                    let resourcesData = [{name: FirmManager.IMAGE_ENTITY + image.ext, buf: image.buf}];
                    FirmManager.saveResourcePack(uid, resourcesData, function (resourcePack) {
                        callback(null, uid);
                    });
                } else {
                    callback(null, uid);
                }
            }
        });
    }

    static update(image, firm, callback) {
        db.collection(ENTITY).findOneAndUpdate({
            _id: new ObjectID(firm.getId()),
        }, {
            $set: {
                name: firm.getName(),
                alias: firm.getAlias(),
                photo: firm.getPhoto(),
                priority: firm.getPriority()
            }
        }, {upsert: true}, function (err, res) {
            if (err) {
                callback(err);
            } else {
                if (image) {
                    let resourcesData = [{name: FirmManager.IMAGE_ENTITY + image.ext, buf: image.buf}];
                    FirmManager.saveResourcePack(firm.getId(), resourcesData, function (resourcePack) {
                        callback(null, firm.getId());
                    });
                } else {
                    callback(null, firm.getId());
                }
            }
        });
    }

    static remove(firm, callback) {
        if (ObjectID.isValid(firm.getId())) {
            db.collection(ENTITY).deleteOne({
                _id: new ObjectID(firm.getId())
            }, function (err, res) {
                if (err) {
                    callback(err);
                } else {
                    FirmManager.deleteResourcePack(firm.getId(), function (status) {
                        if (status) {
                            callback(err);
                        } else {
                            callback(null, res.deletedCount);
                        }
                    });
                }
            });
        } else {
            callback(new Error("Invalid firm's id passed"));
        }
    }

    static loadResourcePack(uid, callback){
        let resourcePack = new ResourcePack(uid, ResourceType.SINGLE, ResourceExtension.IMAGE, FirmManager.ENTITY + "/" + FirmManager.IMAGE_ENTITY);
        ResourceLoader.load(resourcePack, function (err, resources) {
            if(err) {
                callback(err);
            } else {
                resourcePack.setResources(resources);
                callback(null, resourcePack);
            }
        });
    }

    static saveResourcePack(uid, resourcesData, callback){
        let resourcePack = new ResourcePack(uid, ResourceType.SINGLE, ResourceExtension.IMAGE, FirmManager.ENTITY + "/" + FirmManager.IMAGE_ENTITY);
        ResourceLoader.save(resourcePack, resourcesData, function (resources) {
            resourcePack.setResources(resources);
            callback(resourcePack);
        });
    }

    static deleteResourcePack(uid, callback){
        let resourcePack = new ResourcePack(uid, ResourceType.SINGLE, ResourceExtension.IMAGE, FirmManager.ENTITY + "/" + FirmManager.IMAGE_ENTITY);
        ResourceLoader.delete(resourcePack,  function (status) {
            callback(status);
        });
    }
}

module.exports = FirmManager;