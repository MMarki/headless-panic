Game.DynamicTile = function(properties) {
    properties = properties || {};
    // Call the glyph's construtor with our set of properties
    Game.DynamicGlyph.call(this, properties);
    // Set up the properties
    this._name = properties['name'];
    this._walkable = properties['walkable'] || false;
    this._diggable = properties['diggable'] || false;
    this._blocksLight = (properties['blocksLight'] !== undefined) ? properties['blocksLight'] : true;
    this._description = properties['description'] || '';
    this._flammable = properties['flammable'] || false;
    this._lifespan = properties['lifespan'] || 5;
    this._speed = properties['speed'] || 1000;
    this._defaultForeground = this._foreground;
    this._defaultBackground = this._background;
    this._isHazard = properties['isHazard'] || false;
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
Game.DynamicTile.prototype.isFlammable = function() {
    return this._flammable;
}
Game.DynamicTile.prototype.getDescription = function() {
    return this._description;
};

Game.DynamicTile.prototype.getNeighborPositions = function() {
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
        // Just do this part once, we don't grow new flamable substances

        if (this.hasMixin("Spreadable")){
            if (!this.hasTriedSpreading()){
                let newTile = '';
                let neighbors = this.getNeighborPositions();
                // see if they match this._spreadSubstance
                for (let neighbor of neighbors){
                    let tile = this._map.getTile(neighbor.x, neighbor.y);
                    if (this._spreadSubstance && tile.isFlammable()){
                        if (this._name = 'fireTile'){
                            newTile =  Game.DynamicTileRepository.create('fireTile')
                        } else if (this._name = 'hellFireTile'){
                            newTile =  Game.DynamicTileRepository.create('hellFireTile')
                        }
                        this._map.addDynamicTile(newTile, neighbor.x, neighbor.y);
                    }
                }
                this.setTriedSpreading();
            }
        }

        // if in field of view
        let map = this.getMap();

        // Compute the FOV and check if the coordinates are in there.
        let canSee = false;
        let otherX = map._player.getX();
        let otherY = map._player.getY();

        this.getMap().getFov().compute(
            this.getX(), this.getY(), 100, 
            function(x, y, radius, visibility) {
                if (x === otherX && y === otherY) {
                    canSee = true;
                }
            });

        if (canSee){
            this._foreground = ROT.Color.toHex(ROT.Color.randomize(ROT.Color.fromString(this._defaultForeground), [10, 10, 10]));
            this._background = ROT.Color.toHex(ROT.Color.randomize(ROT.Color.fromString(this._defaultBackground), [10, 10, 10]));
        }
    }
};

Game.DynamicTileMixins.Spreadable = {
    name: 'Spreadable',
    init: function(template) { 
        this._spreadSubstance = template['spreadSubstance'] || 'flammable';
        this._triedSpreading = false;
    },
    hasTriedSpreading: function(){
        return this._triedSpreading;
    },
    setTriedSpreading: function(){
        this._triedSpreading = true;
    }
};