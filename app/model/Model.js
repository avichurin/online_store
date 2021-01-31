let async = require("async");
class Model {
    constructor(obj) {
        this.id = obj.id || obj._id;

        this.name = obj.name;
        this.alias = obj.alias;
        this.firm_id = obj.firm_id;
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

    getFirmId() {
        return this.firm_id;
    }

    setFirmId(_firm_id) {
        this.firm_id = _firm_id;
    }

    getPriority() {
        return this.priority;
    }

    setPriority(_priority) {
        this.priority = _priority;
    }

    setSneakers(sneakers){
        this.sneakers = sneakers;
    }

    getSneakers(){
        return this.sneakers;
    }

    getSneakersByAlias(alias){
        for(let i=0; i< this.allSneakers.length; i++){
            if(this.allSneakers[i].alias === alias){
                return this.allSneakers[i];
            }
        }
        return this.allSneakers[0];
    }

    getSneakersFromAll(){
        return this.allSneakers;
    }

    addSneakersToStart(sneakers){
        for(let i=0; i< this.sneakers.length; i++){
            if(this.sneakers[i].alias === sneakers.alias){
                this.sneakers.splice(i, 1);
                break;
            }
        }
        this.sneakers.unshift(sneakers);
    }

    prepareSneakers(countSneakers, random, cb){

        if(random){
            this.sneakers.sort(function() {
                return .5 - Math.random();
            });
        }else{
            this.sneakers.sort(function(a,b) {
                if (a.priority < b.priority)
                    return 1;
                if (a.priority > b.priority)
                    return -1;
                return 0;
            });
        }

        let self = this;
        async.map(this.sneakers, function(sneaker, cb){
            sneaker.loadPhotos(self.alias, cb);
        }, function(err, res){
            cb(err);
        });

        this.allSneakers = [].concat(this.sneakers);
        this.sneakers = this.sneakers.splice(0, countSneakers);


    }
}

module.exports = Model;