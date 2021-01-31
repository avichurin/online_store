let express = require('express');
let router = express.Router();
let firmController = require("../controllers/firms");
let modelController = require("../controllers/models");
let sneakersController = require("../controllers/sneakers");

const {check, validationResult} = require('express-validator/check');
const {sanitizeBody} = require('express-validator/filter');
const crumbs = require("estorm-crumbs");
const Constant = require("../app/constant");
const {PermissionsManager} = require("estorm-permissions");

const {FirmManager} = require("../app/firm");
const {ModelManager} = require("../app/model");
const {SneakersManager} = require("../app/sneakers");
let tempstor = require("estorm-tempstor");

/**
 *
 * FIRMS
 *
 */

// GET home page
router.get('/', PermissionsManager.check([PermissionsManager.P_READ]), function (req, res, next) {

    firmController.list(req, res, function (err, list) {
        if (err) {
            next(err);
        } else {
            res.render('pages/ap/firm/index', {title: 'Firms', firms: list});
        }
    });
});

// GET create firm
router.get('/create', PermissionsManager.check([PermissionsManager.P_READ, PermissionsManager.P_WRITE, PermissionsManager.P_SUDO]), function (req, res, next) {
    let isNotValidate = false;
    let message = "";
    if (req.session.notValid) {
        req.session.notValid = null;
        isNotValidate = true;
        message = req.session.errMessage;
    }

    crumbs.pushForward("Create", "create", res);

    let cancelLink = "/ap";

    res.render('pages/ap/firm/edit', {
        title: 'Create new firm',
        isNotValidate: isNotValidate,
        message: message,
        cancelLink: cancelLink
    });
});

// GET firm by ID
router.get('/:id', PermissionsManager.check([PermissionsManager.P_READ]), function (req, res, next) {

    tempstor.set(req, FirmManager.ENTITY, req.params);
    tempstor.set(req, ModelManager.ENTITY, {firm_id: req.params.id});

    firmController.info(req, res, function (err, firm) {
        if (err) {
            next(err);
        } else {
            modelController.listByFirm(req, res, function (err, list) {
                if (err) {
                    next(err);
                } else {
                    res.locals.addModelLink = "/ap/" + firm.getId() + "/model/create";
                    res.locals.addModelText = "+ Add a model";

                    crumbs.pushForward(firm.getAlias(), firm.getId(), res);

                    res.render('pages/ap/firm/firm', {title: 'Firm ' + firm.getAlias(), firm: firm, models: list});
                }
            });
        }
    });
});

// GET edit firm
router.get('/edit/:id', PermissionsManager.check([PermissionsManager.P_READ, PermissionsManager.P_EDIT, PermissionsManager.P_SUDO]), function (req, res, next) {

    tempstor.set(req, FirmManager.ENTITY, req.params);

    firmController.info(req, res, function (err, firm) {
        if (err) {
            next(err);
        } else {
            let isNotValidate = false;
            let message = "";
            if (req.session.notValid) {
                req.session.notValid = null;
                isNotValidate = true;
                message = req.session.errMessage;
            }

            crumbs.pushForward(firm.getAlias(), firm.getId(), res);
            crumbs.pushForward("Edit", "edit/" + firm.getId(), res);
            let cancelLink = "/ap";

            res.render('pages/ap/firm/edit', {
                title: 'Edit firm',
                firm: firm,
                isNotValidate: isNotValidate,
                message: message,
                cancelLink: cancelLink
            });
        }
    });
});

/**
 * create new firm
 * or update exist firm
 * with checking validation
 */
router.post('/edit', PermissionsManager.check([PermissionsManager.P_EDIT, PermissionsManager.P_WRITE, PermissionsManager.P_SUDO]), [
    check('firm.alias').exists().isLength({
        min: Constant.VALIDATE_MIN,
        max: Constant.VALIDATE_MAX
    }).matches(/^[a-zA-Z][\d\w]+$/).trim(),
    check("firm.name").exists().isLength({min: Constant.VALIDATE_MIN, max: Constant.VALIDATE_MAX}).trim(),

    sanitizeBody('firm.alias').trim().escape(),
    sanitizeBody('firm.name').trim().escape()
], function (req, res, next) {

    tempstor.set(req, FirmManager.ENTITY, req.body.firm);
    let firm = tempstor.get(req, FirmManager.ENTITY);

    console.log(firm);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.session.notValid = true;
        req.session.errMessage = "Enter right data";
        if (firm.id) {
            res.redirect('edit/' + firm.id);
        } else {
            res.redirect('create');
        }
    } else {
        if (firm.id) {
            firmController.update(req, res, function (err, id) {
                if (err) {
                    if (err.code === 11000) {
                        req.session.notValid = true;
                        req.session.errMessage = "Alias is busy";

                        res.redirect('edit/' + firm.id);
                    } else {
                        next(err);
                    }
                } else {
                    res.redirect(id);
                }
            });
        } else {
            firmController.create(req, res, function (err, id) {
                if (err) {
                    if (err.code === 11000) {
                        req.session.notValid = true;
                        req.session.errMessage = "Alias is busy";

                        res.redirect('create');
                    } else {
                        next(err);
                    }
                } else {
                    res.redirect(id);
                }
            });
        }
    }
});

// POST delete firm
router.post('/delete/:id', PermissionsManager.check([PermissionsManager.P_DELETE, PermissionsManager.P_SUDO]), function (req, res, next) {

    tempstor.set(req, FirmManager.ENTITY, req.params);
    tempstor.set(req, ModelManager.ENTITY, {firm_id: req.params.id});

    modelController.listByFirm(req, res, function (err, list) {
        if (err) {
            next(err);
        } else {
            let models = [];
            for(let i = 0; i < list.length; i++){
                models.push(list[i].id + "");
            }

            sneakersController.deleteByModelList(models, function (err, count) {
                if (err) {
                    next(err);
                } else {
                    modelController.deleteList(req, res, function (err, count) {
                        if (err) {
                            next(err);
                        } else {
                            firmController.delete(req, res, function (err, count) {
                                if (err) {
                                    next(err);
                                } else {
                                    res.redirect('/ap');
                                }
                            });
                        }
                    });
                }
            });
        }
    });


});


/**
 *
 * MODELS
 *
 */


// GET create model
router.get('/:firm_id/model/create', PermissionsManager.check([PermissionsManager.P_READ, PermissionsManager.P_WRITE, PermissionsManager.P_SUDO]), function (req, res, next) {
    let isNotValidate = false;
    let message = "";
    if (req.session.notValid) {
        req.session.notValid = null;
        isNotValidate = true;
        message = req.session.errMessage;
    }

    let firm = tempstor.get(req, FirmManager.ENTITY);
    firm.id = req.params.firm_id;

    firmController.info(req, res, function (err, firm) {
        if (err) {
            next(err);
        } else {
            crumbs.pushForward(firm.getAlias(), "/ap/" + firm.getId(), res);
            crumbs.pushForward("Create", "/ap/" + firm.getId() + "/model/create", res);

            let cancelLink = "/ap/" + firm.getId();

            res.render('pages/ap/model/edit', {
                title: 'Create new model',
                isNotValidate: isNotValidate,
                message: message,
                cancelLink: cancelLink,
                firm_id: firm.getId()
            });
        }
    });
});

// GET model by ID
router.get('/:firm_id/model/:id', PermissionsManager.check([PermissionsManager.P_READ]), function (req, res, next) {

    let firm = tempstor.get(req, FirmManager.ENTITY);
    firm.id = req.params.firm_id;

    tempstor.set(req, ModelManager.ENTITY, req.params);
    tempstor.set(req, SneakersManager.ENTITY, {model_id: req.params.id});

    firmController.info(req, res, function (err, firm) {
        if (err) {
            next(err);
        } else {
            modelController.info(req, res, function (err, model) {
                if (err) {
                    next(err);
                } else {
                    sneakersController.listByModel(req, res, function (err, list) {
                        if (err) {
                            next(err);
                        } else {
                            res.locals.addSneakersLink = "/ap/" + firm.getId() + "/model/" + model.getId() + "/sneakers/create";
                            res.locals.addSneakersText = "+ Add a sneakers";

                            crumbs.pushForward(firm.getAlias(), "/ap/" + firm.getId(), res);
                            crumbs.pushForward(model.getAlias(), "/ap/" + firm.getId() + "/model/" + model.getId(), res);

                            res.render('pages/ap/model/model', {
                                title: 'Model ' + model.getAlias(),
                                model: model,
                                sneakers: list,
                                firm_id: req.params.firm_id
                            });
                        }
                    });
                }
            });
        }
    });
});

// GET edit model
router.get('/:firm_id/model/edit/:id', PermissionsManager.check([PermissionsManager.P_READ, PermissionsManager.P_EDIT, PermissionsManager.P_SUDO]), function (req, res, next) {

    let firm = tempstor.get(req, FirmManager.ENTITY);
    firm.id = req.params.firm_id;

    tempstor.set(req, ModelManager.ENTITY, req.params);

    firmController.info(req, res, function (err, firm) {
        if (err) {
            next(err);
        } else {
            modelController.info(req, res, function (err, model) {
                if (err) {
                    next(err);
                } else {
                    let isNotValidate = false;
                    let message = "";
                    if (req.session.notValid) {
                        req.session.notValid = null;
                        isNotValidate = true;
                        message = req.session.errMessage;
                    }

                    crumbs.pushForward(firm.getAlias(), "/ap/" + firm.getId(), res);
                    crumbs.pushForward(model.getAlias(), "/ap/" + firm.getId() + "/model/" + model.getId(), res);
                    crumbs.pushForward("Edit", "/ap/" + firm.getId() + "/model/" + "/edit/" + model.getId(), res);

                    let cancelLink = "/" + firm.getId();

                    res.render('pages/ap/model/edit', {
                        title: 'Edit model',
                        model: model,
                        isNotValidate: isNotValidate,
                        message: message,
                        cancelLink: cancelLink,
                        firm_id: firm.getId()
                    });
                }
            });
        }
    });
});

/**
 * create new model
 * or update exist model
 * with checking validation
 */
router.post('/:firm_id/model/edit', PermissionsManager.check([PermissionsManager.P_EDIT, PermissionsManager.P_WRITE, PermissionsManager.P_SUDO]), [
    check('model.alias').exists().isLength({
        min: Constant.VALIDATE_MIN,
        max: Constant.VALIDATE_MAX
    }).matches(/^[a-zA-Z][\d\w]+$/).trim(),
    check("model.name").exists().isLength({min: Constant.VALIDATE_MIN, max: Constant.VALIDATE_MAX}).trim(),

    sanitizeBody('model.alias').trim().escape(),
    sanitizeBody('model.name').trim().escape()
], function (req, res, next) {



    tempstor.set(req, ModelManager.ENTITY, req.body.model);
    let model = tempstor.get(req, ModelManager.ENTITY);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.session.notValid = true;
        req.session.errMessage = "Enter right data";
        if (model.id) {
            res.redirect('edit/' + model.id);
        } else {
            res.redirect('create');
        }
    } else {
        if (model.id) {
            modelController.update(req, res, function (err, id) {
                if (err) {
                    if (err.code === 11000) {
                        req.session.notValid = true;
                        req.session.errMessage = "Alias is busy";

                        res.redirect('edit/' + model.id);
                    } else {
                        next(err);
                    }
                } else {
                    res.redirect(id);
                }
            });
        } else {
            console.log("here2");
            modelController.create(req, res, function (err, id) {
                if (err) {
                    if (err.code === 11000) {
                        req.session.notValid = true;
                        req.session.errMessage = "Alias is busy";

                        res.redirect('create');
                    } else {
                        next(err);
                    }
                } else {
                    res.redirect(id);
                }
            });
        }
    }
});

// POST delete firm
router.post('/:firm_id/model/delete/:id', PermissionsManager.check([PermissionsManager.P_DELETE, PermissionsManager.P_SUDO]), function (req, res, next) {

    tempstor.set(req, ModelManager.ENTITY, req.params);
    tempstor.set(req, SneakersManager.ENTITY, {model_id: req.params.id});

    modelController.delete(req, res, function (err, count) {
        if (err) {
            next(err);
        } else {
            sneakersController.deleteByModel(req, res, function (err, count) {
                if (err) {
                    next(err);
                } else {
                    res.redirect("/ap/" + req.params.firm_id);
                }
            });
        }
    });
});


/**
 *
 * SNEAKERS
 *
 */


// GET create sneakers
router.get('/:firm_id/model/:model_id/sneakers/create', PermissionsManager.check([PermissionsManager.P_READ, PermissionsManager.P_WRITE, PermissionsManager.P_SUDO]), function (req, res, next) {
    let isNotValidate = false;
    let message = "";
    if (req.session.notValid) {
        req.session.notValid = null;
        isNotValidate = true;
        message = req.session.errMessage;
    }

    let firm = tempstor.get(req, FirmManager.ENTITY);
    firm.id = req.params.firm_id;

    let model = tempstor.get(req, ModelManager.ENTITY);
    model.id = req.params.model_id;

    firmController.info(req, res, function (err, firm) {
        if (err) {
            next(err);
        } else {
            modelController.info(req, res, function (err, model) {
                if (err) {
                    next(err);
                } else {
                    crumbs.pushForward(firm.getAlias(), "/ap/" + firm.getId(), res);
                    crumbs.pushForward(model.getAlias(), "/ap/" + firm.getId() + "/model/" + model.getId(), res);
                    crumbs.pushForward("Create", "/ap/" + firm.getId() + "/model/" + model.getId() + "/sneakers/create", res);

                    let cancelLink = "/ap/" + firm.getId() + "/model/" + model.getId();

                    res.render('pages/ap/sneakers/edit', {
                        title: 'Create new sneakers',
                        isNotValidate: isNotValidate,
                        message: message,
                        cancelLink: cancelLink,
                        firm_id: firm.getId(),
                        model_id: model.getId()
                    });
                }
            });
        }
    });
});

// GET sneakers by ID
router.get('/:firm_id/model/:model_id/sneakers/:id', PermissionsManager.check([PermissionsManager.P_READ]), function (req, res, next) {

    let firm = tempstor.get(req, FirmManager.ENTITY);
    firm.id = req.params.firm_id;

    let model = tempstor.get(req, ModelManager.ENTITY);
    model.id = req.params.model_id;

    tempstor.set(req, SneakersManager.ENTITY, req.params);

    firmController.info(req, res, function (err, firm) {
        if (err) {
            next(err);
        } else {
            modelController.info(req, res, function (err, model) {
                if (err) {
                    next(err);
                } else {
                    sneakersController.info(req, res, function (err, sneakers) {
                        if (err) {
                            next(err);
                        } else {
                            crumbs.pushForward(firm.getAlias(), "/ap/" + firm.getId(), res);
                            crumbs.pushForward(model.getAlias(), "/ap/" + firm.getId() + "/model/" + model.getId(), res);
                            crumbs.pushForward(sneakers.getAlias(), "/ap/" + firm.getId() + "/model/" + model.getId() + "/sneakers/" + sneakers.getId(), res);

                            res.render('pages/ap/sneakers/sneakers', {
                                title: 'Sneakers',
                                sneakers: sneakers,
                                firm_id: firm.getId(),
                                model_id: model.getId()
                            });
                        }
                    });
                }
            });
        }
    });
});

// GET edit sneakers
router.get('/:firm_id/model/:model_id/sneakers/edit/:id', PermissionsManager.check([PermissionsManager.P_READ, PermissionsManager.P_EDIT, PermissionsManager.P_SUDO]), function (req, res, next) {

    let firm = tempstor.get(req, FirmManager.ENTITY);
    firm.id = req.params.firm_id;

    let model = tempstor.get(req, ModelManager.ENTITY);
    model.id = req.params.model_id;

    tempstor.set(req, SneakersManager.ENTITY, req.params);

    firmController.info(req, res, function (err, firm) {
        if (err) {
            next(err);
        } else {
            modelController.info(req, res, function (err, model) {
                if (err) {
                    next(err);
                } else {
                    sneakersController.info(req, res, function (err, sneakers) {
                        if (err) {
                            next(err);
                        } else {
                            let isNotValidate = false;
                            let message = "";
                            if (req.session.notValid) {
                                req.session.notValid = null;
                                isNotValidate = true;
                                message = req.session.errMessage;
                            }

                            crumbs.pushForward(firm.getAlias(), "/ap/" + firm.getId(), res);
                            crumbs.pushForward(model.getAlias(), "/ap/" + firm.getId() + "/model/" + model.getId(), res);
                            crumbs.pushForward(sneakers.getAlias(), "/ap/" + firm.getId() + "/model/" + model.getId() + "/sneakers/" + sneakers.getId(), res);
                            crumbs.pushForward("Edit", "/ap/" + firm.getId() + "/model/" + model.getId() + "/sneakers/edit/" + sneakers.getId(), res);

                            let cancelLink = "/" + firm.getAlias() + '/model/' + model.getId();

                            res.render('pages/ap/sneakers/edit', {
                                title: 'Edit sneakers',
                                sneakers: sneakers,
                                isNotValidate: isNotValidate,
                                message: message,
                                cancelLink: cancelLink,
                                firm_id: firm.getId(),
                                model_id: model.getId()
                            });
                        }
                    });
                }
            });
        }
    });
});

/**
 * create new sneakers
 * or update exist sneakers
 * with checking validation
 */
router.post('/:firm_id/model/:model_id/sneakers/edit', PermissionsManager.check([PermissionsManager.P_EDIT, PermissionsManager.P_WRITE, PermissionsManager.P_SUDO]), [
    check('sneakers.alias').exists().isLength({
        min: Constant.VALIDATE_MIN,
        max: Constant.VALIDATE_MAX
    }).matches(/^[a-zA-Z][\d\w]+$/).trim(),
    check("sneakers.name").exists().isLength({min: Constant.VALIDATE_MIN, max: Constant.VALIDATE_MAX}).trim(),

    sanitizeBody('sneakers.alias').trim().escape(),
    sanitizeBody('sneakers.name').trim().escape()
], function (req, res, next) {

    tempstor.set(req, SneakersManager.ENTITY, req.body.sneakers);
    let sneakers = tempstor.get(req, SneakersManager.ENTITY);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.session.notValid = true;
        req.session.errMessage = "Enter right data";
        if (sneakers.id) {
            res.redirect('edit/' + sneakers.id);
        } else {
            res.redirect('create');
        }
    } else {
        if (sneakers.id) {
            sneakersController.update(req, res, function (err, id) {
                if (err) {
                    if (err.code === 11000) {
                        req.session.notValid = true;
                        req.session.errMessage = "Alias is busy";

                        res.redirect('edit/' + sneakers.id);
                    } else {
                        next(err);
                    }
                } else {
                    res.redirect(id);
                }
            });
        } else {
            sneakersController.create(req, res, function (err, id) {
                if (err) {
                    if (err.code === 11000) {
                        req.session.notValid = true;
                        req.session.errMessage = "Alias is busy";

                        res.redirect('create');
                    } else {
                        next(err);
                    }
                } else {
                    res.redirect(id);
                }
            });
        }
    }
});

// POST delete firm
router.post('/:firm_id/model/:model_id/sneakers/delete/:id', PermissionsManager.check([PermissionsManager.P_DELETE, PermissionsManager.P_SUDO]), function (req, res, next) {

    tempstor.set(req, SneakersManager.ENTITY, req.params);

    sneakersController.delete(req, res, function (err, count) {
        if (err) {
            next(err);
        } else {
            res.redirect("/ap/" + req.params.firm_id + '/model/' + req.params.model_id);
        }
    });
});

module.exports = router;
