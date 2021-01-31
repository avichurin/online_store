let {ResourceLoader} = require("estorm-resources");

class Sneakers {
    constructor(obj) {
        this.id = obj.id || obj._id;

        this.model_id = obj.model_id;
        this.name = obj.name;
        this.alias = obj.alias;
        this.price = parseInt(obj.price);
        this.desc = obj.desc;
        this.photos = obj.photos;
        this.priority = parseInt(obj.priority);
        this.fakePrice = (this.price + this.price * 0.3).toFixed(2);
    }

    getId() {
        return this.id;
    }

    setId(_id) {
        this.id = _id;
    }

    getModelId() {
        return this.model_id;
    }

    setModelId(_model_id) {
        this.model_id = _model_id;
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

    getPrice() {
        return this.price;
    }

    setPrice(_price) {
        this.price = _price;
    }

    getDesc() {
        return this.desc;
    }

    setDesc(_desc) {
        this.desc = _desc;
    }

    getPhotos() {
        return this.photos;
    }

    setPhotos(_photos) {
        this.photos = _photos;
    }

    getPriority() {
        return this.priority;
    }

    setPriority(_priority) {
        this.priority = _priority;
    }

    loadPhotos(modelName, cb){
        let self = this;
        let path = "resources/sneakers/images/"+modelName+"/"+this.alias;
        let pathTiny = "resources/sneakers_tiny/images/"+modelName+"/"+this.alias;
        let pathSmall = "resources/sneakers_small/images/"+modelName+"/"+this.alias;
        ResourceLoader.loadResources(path, function(err, resources){
            self.photos = resources || [];
            self.photosTiny = [];
            self.photosSmall = [];
            for(let i=0; i<self.photos.length; i++){
                let val = self.photos[i];
                self.photos[i] = path + '/' +  encodeURIComponent(val);
                self.photosTiny[i] = pathTiny + '/' +  encodeURIComponent(val);
                self.photosSmall[i] = pathSmall + '/' +  encodeURIComponent(val);
            }
            self.photoShot = self.photos[0];
            self.photoShotTiny = self.photosTiny[0];
            self.photoShotSmall = self.photosSmall[0];

            self.photosJSON = JSON.stringify(self.photos);
            cb(null);
        });

    }
}

module.exports = Sneakers;