Game.DynamicTile = function(properties) {
    properties = properties || {};
    // Call the glyph's construtor with our set of properties
    Game.DynamicGlyph.call(this, properties);
    // Set up the properties. We use false by default.
    var vary = properties['vary'] || false;
    this._walkable = properties['walkable'] || false;
    this._diggable = properties['diggable'] || false;
    this._blocksLight = (properties['blocksLight'] !== undefined) ? properties['blocksLight'] : true;
    this._description = properties['description'] || '';
    this._flammable = properties['flammable'] || false;
    this._isDynamic = properties['isDynamic'] || true;
    this._lifespan = properties['lifespan'] || 5;
    this._speed = properties['speed'] || 1000;
};

// Make items inherit all the functionality from glyphs
Game.DynamicTile.extend(Game.DynamicGlyph);

// Standard getters
Game.DynamicTile.prototype.isWalkable = function() {
    return this._walkable;
}
Game.DynamicTile.prototype.isDiggable = function() {
    return this._diggable;
}
Game.DynamicTile.prototype.isBlockingLight = function() {
    return this._blocksLight;
}
Game.DynamicTile.prototype.getDescription = function() {
    return this._description;
};

Game.DynamicTile.prototype.setX = function(x) {
    this._x = x;
}
Game.DynamicTile.prototype.setY = function(y) {
    this._y = y;
}
Game.DynamicTile.prototype.setMap = function(map) {
    this._map = map;
}
Game.DynamicTile.prototype.getX = function() {
    return this._x;
}
Game.DynamicTile.prototype.getY   = function() {
    return this._y;
}
Game.DynamicTile.prototype.getMap = function() {
    return this._map;
}

Game.DynamicTile.prototype.getSpeed = function() {
    return this._speed;
};

Game.DynamicTileMixins = {};

Game.DynamicTileMixins.Actor = {
    name: 'Actor',
    act: function() { 
        if (this._lifespan > 0) {
            this._lifespan--;
        } else {
            this.getMap().removeDynamicTile(this);
        }
        // Re-render the screen
        Game.refresh();
    }
};