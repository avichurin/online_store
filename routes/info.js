let express = require('express');
let router = express.Router();

// GET home page
router.get('/terms', function (req, res, next) {
    res.render('pages/info/terms', {
        title: 'Terms of Service',
        layout: "layouts/sneakers"
    });
});

router.get('/privacy', function (req, res, next) {
    res.render('pages/info/privacy', {
        title: 'Privacy Policy',
        layout: "layouts/sneakers"
    });
});

router.get('/refund', function (req, res, next) {
    res.render('pages/info/refund', {
        title: 'Refund Policy',
        layout: "layouts/sneakers"
    });
});

router.get('/contacts', function (req, res, next) {
    res.render('pages/info/contacts', {
        title: 'Contacts',
        layout: "layouts/sneakers"
    });
});

router.get('/payment', function (req, res, next) {

    if(!req.query.alias || !req.query.price){
        res.redirect("/");
    }

    let price = +req.query.price;
    price /= 100;
    price = "$" + price;
    req.session.product = {price: price, alias: req.query.alias, id: req.query.id, color: '#'+req.query.color};
    res.redirect("/info/pay");
});

router.get('/pay', function (req, res, next) {

    if(!req.session.product){
        res.redirect("/");
    }

    let product = req.session.product;

    res.render('pages/info/payment', {
        title: 'Payment',
        layout: "layouts/sneakers",
        product: JSON.stringify(product),
        alias: product.alias,
        price: product.price,
        color: product.color
    });

    req.session.product = null;
});

module.exports = router;
