// A repository has a name and a constructor. The constructor is used to create items in the repository.
Game.Repository = function(name, ctor) {
    this._name = name;
    this._templates = {};
    this._ctor = ctor;
    this._randomTemplates = {};
};

// Define a new named template.
Game.Repository.prototype.define = function(name, template, options) {
    this._templates[name] = template;
    // Apply any options
    let disableRandomCreation = options && options['disableRandomCreation'];
    if (!disableRandomCreation) {
        this._randomTemplates[name] = template;
    }
};

// Create an object based on a template.
Game.Repository.prototype.create = function(name, extraProperties) {
    if (!this._templates[name]) {
        throw new Error("No template named '" + name + "' in repository '" +
            this._name + "'");
    }
    // Copy the template
    let template = Object.create(this._templates[name]);
    // Apply any extra properties
    if (extraProperties) {
        for (let key in extraProperties) {
            template[key] = extraProperties[key];
        }
    }
    // Create the object, passing the template as an argument
    return new this._ctor(template);
};

// Create an object based on a random template
Game.Repository.prototype.createRandom = function() {
    // Pick a random key and create an object based off of it.
    let keys = (Object.keys(this._randomTemplates));
    return this.create(keys[Math.floor(Math.random() * keys.length)]);
};

// Create an object based on a random template
Game.Repository.prototype.createRandomConstrained = function(floor) {
    // Pick a random key and create an object based off of it.
    validItems = [];
    for (const [key, props] of Object.entries(this._randomTemplates)) {
        if (props.itemLevel <= floor){
            validItems.push(key);
        }  else if (props.itemLevel === floor+1){
            if(Math.random() >= 0.5){
                validItems.push(key);
            }
        } else if (props.itemLevel === floor+2){
            if(Math.random() >= 0.75){
                validItems.push(key);
            }
        } 
    }
    
    return this.create(validItems[Math.floor(Math.random() * validItems.length)]);
};

// Create an object based on a random template, by template frequency
Game.Repository.prototype.createRandomByFrequency = function(key) {
    let frequencyForFloor = this.repoFrequency[key];
    let unWrappedArray = [];
    for (let i = 0; i < frequencyForFloor.length; i++) {
        let item = frequencyForFloor[i];
        let frequency = Object.values(item)[0];

        for (let j = 0; j < frequency; j++){
            unWrappedArray.push(Object.keys(item)[0]);
        }
    }

    let creature = unWrappedArray[Math.floor(Math.random() * unWrappedArray.length)];
    return this.create(creature);
    
};