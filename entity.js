Game.Entity = function(properties) {
    properties = properties || {};
    // Call the glyph's constructor with our set of properties
    Game.DynamicGlyph.call(this, properties);
    // Instantiate any properties from the passed object
    this._x = properties['x'] || 0;
    this._y = properties['y'] || 0;
    this._map = null;
    // Acting speed
    this._speed = properties['speed'] || 1000;
};
// Make entities inherit all the functionality from glyphs
Game.Entity.extend(Game.DynamicGlyph);

Game.Entity.prototype.setX = function(x) {
    this._x = x;
}
Game.Entity.prototype.setY = function(y) {
    this._y = y;
}
Game.Entity.prototype.setMap = function(map) {
    this._map = map;
}
Game.Entity.prototype.setSpeed = function(speed) {
    this._speed = speed;
};
Game.Entity.prototype.getX = function() {
    return this._x;
}
Game.Entity.prototype.getY   = function() {
    return this._y;
}
Game.Entity.prototype.getMap = function() {
    return this._map;
}
Game.Entity.prototype.getSpeed = function() {
    return this._speed;
};

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

Game.Entity.prototype.tryMove = function(x, y) {
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
    }
    return false;
}

Game.Entity.prototype.tryMoveNoAttack = function(x, y) {
    var map = this.getMap();
    console.log('x: ' + x + "y: " + y)
    var tile = map.getTile(x, y);
    var target = map.getEntityAt(x, y);
    // If an entity was present at the tile
    if (target) {
        return false;
    // Check if we can walk on the tile and if so simply walk onto it
    } else if (tile.isWalkable()) {        
        // Update the entity's position
        return true;
    }
    return false;
}