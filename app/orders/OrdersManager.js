let db = require("estorm-db").get();

const ENTITY = "orders";

class OrdersManager {

    static get ENTITY() {
        return ENTITY;
    }

    static create(data, callback) {
        db.collection(ENTITY).insertOne({
            data: data
        }, function (err, res) {
            if (err) {
                callback(err);
            } else {
                callback(null);
            }
        });
    }

}

module.exports = OrdersManager;