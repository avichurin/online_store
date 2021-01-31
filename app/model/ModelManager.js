let db = require("estorm-db").get();
let Model = require("./Model");
let ObjectID = require('mongodb').ObjectID;
let async = require("async");

const ENTITY = "model";

class ModelManager {

    static get ENTITY() {
        return ENTITY;
    }

    static init() {
        db.collection(ENTITY).createIndex({alias: 1}, {unique: true});
        db.collection(ENTITY).createIndex({firm_id: 1});
    }

    static list(query, callback) {
        db.collection(ENTITY).find(query).toArray(function (err, res) {
            if (err) {
                callback(err);
            } else {
                async.map(res, function (l, cb) {
                    let model = new Model(l);
                    cb(null, model);
                }, function (err, results) {
                    callback(err, results);
                });
            }
        });
    }

    static listByFirm(model, callback) {
        db.collection(ENTITY).find({firm_id: model.getFirmId()}).sort({priority: -1}).toArray(function (err, res) {
            if (err) {
                callback(err);
            } else {
                async.map(res, function (l, cb) {
                    let model = new Model(l);
                    cb(null, model);
                }, function (err, results) {
                    callback(err, results);
                });
            }
        });
    }

    static info(model, callback) {
        if (ObjectID.isValid(model.getId())) {
            db.collection(ENTITY).findOne({
                _id: new ObjectID(model.getId())
            }, function (err, res) {
                if (err || !res) {
                    callback(new Error("Model not found"));
                } else {
                    let model = new Model(res);
                    callback(null, model);
                }
            });
        } else {
            callback(new Error("Invalid model's id passed"));
        }
    }

    static get(model, callback) {
        db.collection(ENTITY).findOne({alias: model.getAlias()}, function (err, res) {
            if (err || !res) {
                callback(new Error("Model not found"));
            } else {
                let model = new Model(res);
                callback(null, model);
            }
        });
    }

    static create(model, callback) {
        db.collection(ENTITY).insertOne({
            name: model.getName(),
            alias: model.getAlias(),
            firm_id: model.getFirmId(),
            priority: model.getPriority()
        }, function (err, res) {
            if (err) {
                callback(err);
            } else {
                callback(null, res.insertedId);
            }
        });
    }

    static update(model, callback) {
        db.collection(ENTITY).findOneAndUpdate({
            _id: new ObjectID(model.getId())
        }, {
            $set: {
                name: model.getName(),
                alias: model.getAlias(),
                firm_id: model.getFirmId(),
                priority: model.getPriority()
            }
        }, {upsert: true}, function (err, res) {
            if (err) {
                callback(err);
            } else {
                let id = res.lastErrorObject.upserted || res.value._id;
                callback(null, id);
            }
        });
    }

    static remove(model, callback) {
        if (ObjectID.isValid(model.getId())) {
            db.collection(ENTITY).deleteOne({
                _id: new ObjectID(model.getId())
            }, function (err, res) {
                if (err) {
                    callback(err);
                } else {
                    callback(null, res.deletedCount);
                }
            });
        } else {
            callback(new Error("Invalid model's id passed"));
        }
    }

    static removeList(model, callback) {
        db.collection(ENTITY).deleteMany({
            firm_id: model.getFirmId()
        }, function (err, res) {
            if (err) {
                callback(err);
            } else {
                callback(null, res.deletedCount);
            }
        });
    }
}

module.exports = ModelManager;