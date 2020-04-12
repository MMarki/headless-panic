Game.Entity = function(properties) {
    properties = properties || {};
    // Call the glyph's constructor with our set of properties
    Game.Glyph.call(this, properties);
    // Instantiate any properties from the passed object
    this._name = properties['name'] || '';
    this._x = properties['x'] || 0;
    this._y = properties['y'] || 0;
    // Create an object which will keep track what mixins we have
    // attached to this entity based on the name property
    this._attachedMixins = {};
    // Create a similar object for groups
    this._attachedMixinGroups = {};
    // Setup the object's mixins
    var mixins = properties['mixins'] || [];
    for (var i = 0; i < mixins.length; i++) {
        // Copy over all properties from each mixin as long
        // as it's not the name or the init property. We
        // also make sure not to override a property that
        // already exists on the entity.
        for (var key in mixins[i]) {
            if (key != 'init' && key != 'name' && !this.hasOwnProperty(key)) {
                this[key] = mixins[i][key];
            }
        }
        // Add the name of this mixin to our attached mixins
        this._attachedMixins[mixins[i].name] = true;
        // If a group name is present, add it
        if (mixins[i].groupName) {
            this._attachedMixinGroups[mixins[i].groupName] = true;
        }
        // Finally call the init function if there is one
        if (mixins[i].init) {
            mixins[i].init.call(this, properties);
        }
    }
};
// Make entities inherit all the functionality from glyphs
Game.Entity.extend(Game.Glyph);

Game.Entity.prototype.setName = function(name) {
    this._name = name;
}
Game.Entity.prototype.setX = function(x) {
    this._x = x;
}
Game.Entity.prototype.setY = function(y) {
    this._y = y;
}
Game.Entity.prototype.setMap = function(map) {
    this._map = map;
}
Game.Entity.prototype.getName = function() {
    return this._name;
}
Game.Entity.prototype.getX = function() {
    return this._x;
}
Game.Entity.prototype.getY   = function() {
    return this._y;
}
Game.Entity.prototype.getMap = function() {
    return this._map;
}

Game.Entity.prototype.setPosition = function(x, y) {
    var oldX = this._x;
    var oldY = this._y;
    this._x = x;
    this._y = y;
    // If the entity is on a map, notify the map that the entity has moved.
    if (this._map) {
        this._map.updateEntityPosition(this, oldX, oldY);
    }
}

Game.Entity.prototype.hasMixin = function(obj) {
    // Allow passing the mixin itself or the name / group name as a string
    if (typeof obj === 'object') {
        return this._attachedMixins[obj.name];
    } else {
        return this._attachedMixins[obj] || this._attachedMixinGroups[obj];
    }
}

Game.Entity.prototype.tryMove = function(x, y, map) {
    var map = this.getMap();
    var tile = map.getTile(x, y);
    var target = map.getEntityAt(x, y);
    // If an entity was present at the tile
    if (target) {
        // If we are an attacker, try to attack the target
        if ((this.hasMixin('Attacker') && (this.hasMixin(Game.EntityMixins.PlayerActor) || target.hasMixin(Game.EntityMixins.PlayerActor)))) {
            this.attack(target);
            return true;
        } else {
            // If not, nothing we can do, but we can't move to the tile
            return false;
        }
    // Check if we can walk on the tile and if so simply walk onto it
    } else if (tile.isWalkable()) {        
        // Update the entity's position
       this.setPosition(x, y);
       var items = this.getMap().getItemsAt(x, y);
        if (items) {
            if (items.length === 1) {
                Game.sendMessage(this, "You see %s.", [items[0].describeA()]);
            } else {
                Game.sendMessage(this, "There are several objects here.");
            }
        }
        return true;
    // Check if the tile is diggable, and if so try to dig it
    } else if (tile.isDiggable()) {
        if (this.hasMixin(Game.EntityMixins.PlayerActor)){
            map.dig(x, y);
            return true;
        }
        return false;
    }
    return false;
}