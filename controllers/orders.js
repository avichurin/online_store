let {OrdersManager} = require("../app/orders");
let tempstor = require("estorm-tempstor");

/**
 * ADD NEW ORDER
 */
module.exports.create = function (req, res, callback) {
    OrdersManager.create(tempstor.get(req, OrdersManager.ENTITY).data, callback);
};