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
    var disableRandomCreation = options && options['disableRandomCreation'];
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
    var template = Object.create(this._templates[name]);
    // Apply any extra properties
    if (extraProperties) {
        for (var key in extraProperties) {
            template[key] = extraProperties[key];
        }
    }
    // Create the object, passing the template as an argument
    return new this._ctor(template);
};

// Create an object based on a random template
Game.Repository.prototype.createRandom = function() {
    // Pick a random key and create an object based off of it.
    var keys = (Object.keys(this._randomTemplates));
    return this.create(keys[Math.floor(Math.random() * keys.length)]);
};

// Create an object based on a random template, by template frequency
Game.Repository.prototype.createRandomByFrequency = function(key) {
    var frequencyForFloor = this.repoFrequency[key];
    var unWrappedArray = [];
    for (var i = 0; i < frequencyForFloor.length; i++) {
        var item = frequencyForFloor[i];
        var frequency = Object.values(item)[0];

        for (var j = 0; j < frequency; j++){
            unWrappedArray.push(Object.keys(item)[0]);
        }
    }

    var creature = unWrappedArray[Math.floor(Math.random() * unWrappedArray.length)];
    return this.create(creature);
    
};