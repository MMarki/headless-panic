Game.Gas = function(properties) {
    properties = properties || {};
    // Call the glyph's construtor with our set of properties
    Game.Glyph.call(this, properties);
    // Set up the properties
    this._name = properties['name'];
    this._blocksLight = (properties['blocksLight'] !== undefined) ? properties['blocksLight'] : true;
    this._description = properties['description'] || '';
    this._flammable = properties['flammable'] || false;
    this._lifespan = properties['lifespan'] || 5;
    this._speed = properties['speed'] || 1000;
    this._defaultForeground = this._foreground;
    this._defaultBackground = this._background;
    this._isHazard = properties['isHazard'] || false;
};

Game.Gas.extend(Game.Glyph);

// Standard getters
Game.Gas.prototype.isBlockingLight = function() {
    return this._blocksLight;
}
Game.Gas.prototype.isFlammable = function() {
    return this._flammable;
}
Game.Gas.prototype.getDescription = function() {
    return this._description;
};

Game.Gas.prototype.getSpeed = function() {
    return this._speed;
};

Game.Gas.prototype.getNeighborPositions = function() {
    let tiles = [];
    // Generate all possible offsets
    for (let dX = -1; dX < 2; dX ++) {
        for (let dY = -1; dY < 2; dY++) {
            // Make sure it isn't the same tile
            if (dX === 0 && dY === 0 || (dX === dY)) {
                continue;
            }
            tiles.push({x: this._x + dX, y: this._y + dY});
        }
    }
    return Game.randomize(tiles);
};

Game.Gas.prototype.setX = function(x) {
    this._x = x;
}
Game.Gas.prototype.setY = function(y) {
    this._y = y;
}
Game.Gas.prototype.setMap = function(map) {
    this._map = map;
}
Game.Gas.prototype.getX = function() {
    return this._x;
}
Game.Gas.prototype.getY   = function() {
    return this._y;
}
Game.Gas.prototype.getMap = function() {
    return this._map;
}
Game.Gas.prototype.act = function() {
    if (this._lifespan > 0) {
        this._lifespan--;
    } else {
        this.getMap().removeGas(this);
    }

    this._foreground = ROT.Color.toHex(ROT.Color.randomize(ROT.Color.fromString(this._defaultForeground), [10, 10, 10]));
    this._background = ROT.Color.toHex(ROT.Color.randomize(ROT.Color.fromString(this._defaultBackground), [10, 10, 10]));
    // Re-render the screen
    Game.refresh();
}
