let express = require('express');
let path = require('path');
let favicon = require('serve-favicon');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let bb = require("express-busboy");
let device = require("express-device");

const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const {PermissionsManager} = require("estorm-permissions");
const crumbs = require("estorm-crumbs");

let {LoginRouter, LogoutRouter} = require('estorm-auth');
let {ElabRoute, DBManager} = require('estorm-elab');
let sneakers = require('./routes/sneakers');
let ap = require('./routes/ap');
let api = require('./routes/api');
let info = require('./routes/info');

const environment = process.env.NODE_ENV || 'development';
let config = require('./app/config')[environment];

const {FirmManager} = require("./app/firm");
const {ModelManager} = require("./app/model");
const {SneakersManager} = require("./app/sneakers");

const {TokenManager, AuthManager} = require('estorm-auth');

let compression = require('compression');

TokenManager.init(config.JWT_SECRET);
AuthManager.init(config.RENEW_TOKEN_URL, config.ESTORM_TOKEN_CHECK_URL, config.ESTORM_LOGIN_URL);

// init dev and prod dbs
DBManager.register(config.DB_LOGIN, config.DB_PASSWORD, config.DB_NAME, config.DB_SCHEME, config.DB_URL);
DBManager.register(config.DB_LOGIN, config.DB_PASSWORD, config.DB_SESSIONS_NAME, config.DB_SCHEME, config.DB_URL);

let url = require('url');

let app = express();

FirmManager.init();
ModelManager.init();
SneakersManager.init();
AuthManager.JWTInit(app);

app.use(session({
    store: new MongoStore({url: config.DB_SCHEME + config.DB_LOGIN + ':' + config.DB_PASSWORD + config.DB_URL + config.DB_SESSIONS_NAME}),
    secret: config.MONGO_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(compression());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view options', {layout: 'layouts/layout'});
app.set('view engine', 'hbs');

const hbs = require('hbs');
hbs.registerPartials(__dirname + '/views/partials');
hbs.registerHelper('ifCond', function (v1, operator, v2, options) {

    switch (operator) {
        case '==':
            return (v1 == v2) ? options.fn(this) : options.inverse(this);
        case '===':
            return (v1 === v2) ? options.fn(this) : options.inverse(this);
        case '!=':
            return (v1 != v2) ? options.fn(this) : options.inverse(this);
        case '!==':
            return (v1 !== v2) ? options.fn(this) : options.inverse(this);
        case '<':
            return (v1 < v2) ? options.fn(this) : options.inverse(this);
        case '<=':
            return (v1 <= v2) ? options.fn(this) : options.inverse(this);
        case '>':
            return (v1 > v2) ? options.fn(this) : options.inverse(this);
        case '>=':
            return (v1 >= v2) ? options.fn(this) : options.inverse(this);
        case '&&':
            return (v1 && v2) ? options.fn(this) : options.inverse(this);
        case '||':
            return (v1 || v2) ? options.fn(this) : options.inverse(this);
        default:
            return options.inverse(this);
    }
});

// detect device
app.use(device.capture());

// set global base URL
app.use(function (req, res, next) {


    res.locals.base_url = url.format({
        protocol: req.protocol,
        host: req.get('host')
    }).replace("http", "https");

    res.locals.routePath = req.path;
    next();
});

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// open access for public and resources folders
app.use(express.static(path.join(__dirname, 'public')));
app.use("/resources", express.static(path.join(__dirname, 'resources')));

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.png')));
app.use(logger('dev'));

bb.extend(app);
app.use(cookieParser());

app.use('/api', function (req, res, next) {
    req.apireq = true;
    next();
}, api);

app.use('/info', function (req, res, next) {
    req.webreq = true;
    next();
}, info);

app.use('/', function (req, res, next) {
    req.webreq = true;
    next();
}, sneakers);

app.use(AuthManager.JWTMiddleware);

/**
 * set permissions to request user
 * set user to response
 */
app.use(function (req, res, next) {
    if (req.user) {
        req.user.permissionsObject = PermissionsManager.createPermissionsObject(req.user.permissions);
        res.locals.baseUser = req.user;
    }
    next();
});

// main routing
app.use('/login', LoginRouter);
app.use('/logout', LogoutRouter);

app.use('/ap', function (req, res, next) {
    res.locals.routePath = "/ap";

    res.locals.addLink = "/ap/create";
    res.locals.addText = "+ Add a firm";
    next();
}, crumbs.push("Firms", "/ap"), ap);
app.use('/elab', crumbs.push("Firms", "/elab"), ElabRoute);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    if (req.apireq || req.method !== "GET") {
        let json = {status: "err", message: err.status, err_status: err.message};
        res.json(json);
    } else if (req.webreq) {
        res.render('pages/sneakers/404', {layout: "layouts/sneakers"});
    } else {
        // set locals, only providing error in development
        res.locals.message = err.message;
        res.locals.error = req.app.get('env') === 'development' ? err : {};

        // render the error page
        res.status(err.status || 500);
        res.render('pages/error');
    }
});

module.exports = app;
