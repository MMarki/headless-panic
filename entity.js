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
    this._normalSpeed = this._speed;
    this._notMonster = properties['notMonster'] || false;
    //attribrutes
    this._fierce = properties['fierce'] || false; //can sometimes attack twice per turn
    this._armored = properties['armored'] || false; // 1 higher DEF than usual
    this._ratThreaten = properties['ratThreaten'] || false; // rats won't attack you
    this._toady = properties['toady'] || false; // better defense on water tiles
    this._venomous = properties['venomous'] || false; // chance to poison on hit
    this._strengthened = properties['strengthened'] || false; // additional strength from heads
    this._paralytic = properties['paralytic'] || false; // chance to paralyze on hit
    this._pusher = properties['pusher'] || false; // chance to knock back enemy on hit
    this._isThrowTarget = false;
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

Game.Entity.prototype.isNotMonster = function() {
    return this._notMonster;
}

Game.Entity.prototype.setPosition = function(x, y) {
    let oldX = this._x;
    let oldY = this._y;
    this._x = x;
    this._y = y;
    // If the entity is on a map, notify the map that the entity has moved.
    if (this._map) {
        this._map.updateEntityPosition(this, oldX, oldY);
    }
}

Game.Entity.prototype.tryMove = function(x, y) {
    const map = this.getMap();
    const tile = map.getTile(x, y);
    const target = map.getEntityAt(x, y);
    // If an entity was present at the tile
    if (!this.hasMixin('Affectible') || !this.hasEffect('paralyzed')){
        if (target) {
            // If we are an attacker, try to attack the target
            if ((this.hasMixin('Attacker') && (this.hasMixin('PlayerActor') || target.hasMixin('PlayerActor')))) {
                this.attack(target);
                if (this._fierce && Math.random() > 0.50){
                    if (map.getEntityAt(x, y)){
                        this.attack(target);
                    }
                }
                if(this.hasMixin('PlayerActor')){
                    this._hasNotMovedThisTurn = false;
                }
                return true;
            } else {
                // If not, nothing we can do, but we can't move to the tile
                return false;
            }
        // Check if we can walk on the tile and if so simply walk onto it
        } else if ((tile.isWalkable() && !(this.hasMixin('Swimmer'))) || ((tile === Game.Tile.shallowWaterTile || tile === Game.Tile.shallowWaterTile ) && this.hasMixin('Swimmer'))) {        
            // Update the entity's position
            this.setPosition(x, y);
            if(this.hasMixin('PlayerActor')){
                this._hasNotMovedThisTurn = false;
            }
            //open doors
            if(tile === Game.Tile.doorTile) {
               this.getMap()._tiles[x][y] = Game.Tile.openDoorTile;
            }
            if(tile === Game.Tile.fernTile) {
                this.getMap()._tiles[x][y] = Game.Tile.grassTile;
            }
            if((this.hasMixin('Affectible')) && this.hasEffect('burning') && tile === Game.Tile.grassTile && !this.hasMixin('Flyer') && this._levitating !== true) {
                let tempList = [];
                tempList.push({x: x, y: y});
                this._map.cellGrow(tempList, 'fireTile', 1, true);
            }
            if((this.hasMixin('Affectible')) && this.hasEffect('burning') && !this.hasMixin('Flyer') && this._levitating !== true && (tile === Game.Tile.shallowWaterTile || tile === Game.Tile.waterTile || tile._name === 'wineTile')) {
                if (this.hasEffect('burning')){
                    var effects = this._effects;
                    for (var i = 0; i < effects.length; i++){
                        if ('burning' === effects[i].getName()){
                            this.removeEffect(i);
                        }
                    }
                }
            }
            let items = this.getMap().getItemsAt(x, y);
            if (items) {
                if (items.length !== 1) {
                    Game.sendMessage(this, "There are several objects here.");
                }
            }
            return true;
        }
    }
    return false;
}

Game.Entity.prototype.tryMoveTeleport = function(x, y) {
    const map = this.getMap();
    if (x > Game.getScreenWidth() || x < 0) return false;
    if (y > Game.getScreenHeight() || y < 0) return false;
    //console.log('x: ' + x + "y: " + y)
    let tile = map.getTile(x, y);
    let target = map.getEntityAt(x, y);
    // If an entity was present at the tile
    if (target) {
        return false;
    // Check if we can walk on the tile
    } else if (tile.isWalkable()) {        
        return true;
    }
    return false;
}

Game.Entity.prototype.applyNewEffects = function(){
    const map = this.getMap();
    let tile = map.getTile(this._x, this._y);
    let gas = map.getGas(this._x, this._y);

    //check if they already have it,
    // if so, change the existing duration instead of adding a new one

    if (this.hasMixin('Affectible')){
        if ( (tile._name === 'fireTile' || tile._name === 'hellFireTile') && !this.hasMixin('Flyer') && this._levitating !== true){
            if (this.hasEffect('burning')){
                let index = this.getEffectIndex('burning');
                this.removeEffect(index);
            }
            let duration = 7;
            let name = 'burning';
            let newEffect = new Game.Effect(duration, name);
            this.setEffect(newEffect);
        } else if (this.hasMixin('PlayerActor') && tile._name === 'protectTile' && this._levitating !== true){
            if (this.hasEffect('protected')){
                let index = this.getEffectIndex('protected');
                this.removeEffect(index);
            }
            let duration = 6;
            let name = 'protected';
            let newEffect = new Game.Effect(duration, name);
            this.setEffect(newEffect);
            map.setTile(this._x, this._y, Game.Tile.floorTile);
        }  else if (this.hasMixin('PlayerActor') && tile._name === 'vulnerabilityTile' && this._levitating !== true){
            if (this.hasEffect('vulnerable')){
                let index = this.getEffectIndex('vulnerable');
                this.removeEffect(index);
            }
            let duration = 6;
            let name = 'vulnerable';
            let newEffect = new Game.Effect(duration, name);
            this.setEffect(newEffect);
            map.setTile(this._x, this._y, Game.Tile.floorTile);
        }

        if (gas !== null && gas._name === 'darknessTile' && this.getName()!== 'wraith'){
            if (this.hasEffect('blind')){
                let index = this.getEffectIndex('blind');
                this.removeEffect(index);
            }
            let duration = 20;
            let name =  'blind';
            let newEffect = new Game.Effect(duration, name);
            this.setEffect(newEffect);
        } else if (gas !== null && gas._name === 'poisonTile'){
            if (this.hasEffect('poisoned')){
                let index = this.getEffectIndex('poisoned');
                this.removeEffect(index);
            }
            let duration = 14;
            let name =  'poisoned';
            let newEffect = new Game.Effect(duration, name);
            this.setEffect(newEffect);
        }
    }
}