let projectResourcePack = null;
let async = require("async");

class Firm {
    constructor(obj) {
        this.id = obj.id || obj._id;

        this.name = obj.name;
        this.alias = obj.alias;
        this.photo = obj.photo || "";
        this.priority = parseInt(obj.priority);
    }

    getId() {
        return this.id;
    }

    setId(_id) {
        this.id = _id;
    }

    getName() {
        return this.name;
    }

    setName(_name) {
        this.name = _name;
    }

    getAlias() {
        return this.alias;
    }

    setAlias(_alias) {
        this.alias = _alias;
    }

    getPhoto() {
        return this.photo;
    }

    setPhoto(_photo) {
        this.photo = _photo;
    }

    getPriority() {
        return this.priority;
    }

    setPriority(_priority) {
        this.priority = _priority;
    }

    getResourcePack(){
        return projectResourcePack;
    }

    setResourcePack(_resourcePack){
        projectResourcePack = _resourcePack;
        this.photo = "/" + _resourcePack.path + _resourcePack.getResources()[0];
    }

    setModels(models){
        this.models = models;
    }

    getModels(){
        return this.models;
    }

    prepareModels(countModels, countSneakers, random, cb){

        if(random){
            this.models.sort(function() {
                return .5 - Math.random();
            });
        }else{
            this.models.sort(function(a,b) {
                if (a.priority < b.priority)
                    return 1;
                if (a.priority > b.priority)
                    return -1;
                return 0;
            });
        }

        this.models = this.models.splice(0, countModels);

        async.map(this.models, function(model, cb){
            model.prepareSneakers(countSneakers, random, cb);
        }, function(err, res){
            cb();
        });

    }
}

module.exports = Firm;