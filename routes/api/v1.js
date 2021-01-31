let express = require('express');
let router = express.Router();

let {PermissionsManager} = require("estorm-permissions");
let {AuthManager} = require("estorm-auth");

/* GET home page. */
router.get('/units', AuthManager.JWTMiddlewareAPI, PermissionsManager.check([PermissionsManager.P_READ]), function (req, res, next) {
    res.json({status: ok});
});

module.exports = router;
