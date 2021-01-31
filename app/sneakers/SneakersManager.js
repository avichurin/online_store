let db = require("estorm-db").get();
let Sneakers = require("./Sneakers");
let ObjectID = require('mongodb').ObjectID;
let async = require("async");


const ENTITY = "sneakers";

class SneakersManager {

    static get ENTITY() {
        return ENTITY;
    }

    static init() {
        db.collection(ENTITY).createIndex({alias: 1}, {unique: true});
        db.collection(ENTITY).createIndex({model_id: 1});
    }

    static list(query, callback) {
        db.collection(ENTITY).find(query).sort({priority: -1}).toArray(function (err, res) {
            if (err) {
                callback(err);
            } else {
                async.map(res, function (l, cb) {
                    let sneakers = new Sneakers(l);
                    cb(null, sneakers);
                }, function (err, results) {
                    callback(err, results);
                });
            }
        });
    }

    static listByModel(sneakers, callback) {
        db.collection(ENTITY).find({model_id: sneakers.getModelId()}).sort({priority: -1}).toArray(function (err, res) {
            if (err) {
                callback(err);
            } else {
                async.map(res, function (l, cb) {
                    let sneakers = new Sneakers(l);
                    cb(null, sneakers);
                }, function (err, results) {
                    callback(err, results);
                });
            }
        });
    }


    static info(sneakers, callback) {
        if (ObjectID.isValid(sneakers.getId())) {
            db.collection(ENTITY).findOne({
                _id: new ObjectID(sneakers.getId())
            }, function (err, res) {
                if (err || !res) {
                    callback(new Error("Sneakers not found"));
                } else {
                    let sneakers = new Sneakers(res);
                    callback(null, sneakers);
                }
            });
        } else {
            callback(new Error("Invalid sneakers's id passed"));
        }
    }

    static get(sneakers, callback) {
        db.collection(ENTITY).findOne({alias: sneakers.getAlias()}, function (err, res) {
            if (err || !res) {
                callback(new Error("Sneakers not found"));
            } else {
                let sneakers = new Sneakers(res);
                callback(null, sneakers);
            }
        });
    }

    static create(sneakers, callback) {
        db.collection(ENTITY).insertOne({
            model_id: sneakers.getModelId(),
            name: sneakers.getName(),
            alias: sneakers.getAlias(),
            price: sneakers.getPrice(),
            desc: sneakers.getDesc(),
            photos: sneakers.getPhotos(),
            priority: sneakers.getPriority()
        }, function (err, res) {
            if (err) {
                callback(err);
            } else {
                callback(null, res.insertedId);
            }
        });
    }

    static update(sneakers, callback) {
        db.collection(ENTITY).findOneAndUpdate({
            _id: new ObjectID(sneakers.getId())
        }, {
            $set: {
                model_id: sneakers.getModelId(),
                name: sneakers.getName(),
                alias: sneakers.getAlias(),
                price: sneakers.getPrice(),
                desc: sneakers.getDesc(),
                photos: sneakers.getPhotos(),
                priority: sneakers.getPriority()
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

    static remove(sneakers, callback) {
        if (ObjectID.isValid(sneakers.getId())) {
            db.collection(ENTITY).deleteOne({
                _id: new ObjectID(sneakers.getId())
            }, function (err, res) {
                if (err) {
                    callback(err);
                } else {
                    callback(null, res.deletedCount);
                }
            });
        } else {
            callback(new Error("Invalid sneakers's id passed"));
        }
    }

    static removeByModel(sneakers, callback) {
        db.collection(ENTITY).deleteMany({
            model_id: sneakers.getModelId()
        }, function (err, res) {
            if (err) {
                callback(err);
            } else {
                callback(null, res.deletedCount);
            }
        });
    }

    static removeByModelList(models, callback) {
        console.log(models);
        db.collection(ENTITY).remove({
            model_id: {$in: models}
        }, function (err, res) {
            if (err) {
                callback(err);
            } else {
                callback(null, res.deletedCount);
            }
        });
    }
}

module.exports = SneakersManager;