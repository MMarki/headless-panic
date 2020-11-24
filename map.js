Game.Map = function(tiles, player, items) {
    this._tiles = tiles;
    // cache the width and height based
    // on the length of the dimensions of
    // the tiles array
    this._width = tiles.length;
    this._height = tiles[0].length;
    // create a hash table which will hold the entities
    this._entities = {};
    // Create a table which will hold the items
    if (items <= null){
        this._items = items;
    } else {
        this._items = {};
    }
    // create the engine and scheduler
    this._scheduler = new ROT.Scheduler.Speed();
    this._engine = new ROT.Engine(this._scheduler);
    // add the player
    this._player = player;
    this.addEntityAtRandomPosition(player);
    // 15 entities per floor
    for (var i = 0; i < 10; i++) {
        // Add a random entity
        var randomEntity = Game.EntityRepository.createRandomByFrequency('L' + Game.getLevel())
        this.addEntityAtRandomPosition( randomEntity );
        this.addEntityAtRandomPosition(Game.EntityRepository.create("barrel"));
    }
    // if on L3, create one rat king
    if (Game.getLevel === 3){
        Game.EntityRepository.create('rat king')
    }
    
    // 15 items per floor
    for (var i = 0; i < 4; i++) {
        // Add a random entity
        this.addItemAtRandomPosition(Game.ItemRepository.createRandom());
    }
    this.addItemAtRandomPosition(Game.GatedItemRepository.createRandom());
    
    //set up the field of vision
    this._fov = {};
    this.setupFov();
    // Add weapons and armor to the map in random positions
    var templates = ['dagger', 'axe', 'dart', 'sword', 'spear', 'leather', 'scalemail', 'chainmail', 'platemail'];
    for (var i = 0; i < templates.length; i++) {
        this.addItemAtRandomPosition(Game.ItemRepository.create(templates[i]));
    }
    //set up the explored array
    this._explored = new Array(this._width);
    this._setupExploredArray();
};

// Standard getters
Game.Map.prototype.getWidth = function() {
    return this._width;
};
Game.Map.prototype.getHeight = function() {
    return this._height;
};
Game.Map.prototype.getEngine = function() {
    return this._engine;
}
Game.Map.prototype.getPlayer = function() {
    return this._player;
};
Game.Map.prototype.getEntities = function() {
    return this._entities;
}
Game.Map.prototype.getEntityAt = function(x, y){
    // Iterate through all entities searching for one with matching position
    return this._entities[x + ',' + y];
}

// Gets the tile for a given coordinate set
Game.Map.prototype.getTile = function(x, y) {
    // Make sure we are inside the bounds. If we aren't, return
    // null tile.
    if (x < 0 || x >= this._width || y < 0 || y >= this._height) {
        return Game.Tile.nullTile;
    } else {
        return this._tiles[x][y] || Game.Tile.nullTile;
    }
};

Game.Map.prototype.shatter = function(x, y) {
    for (var i = x-2; i <= x + 2; i++){
        for (var j = y-2; j <= y+2; j++){
            if (!(i < 0 || i >= this._width || j < 0 || j >= this._height)) {
                this.dig(i,j);
            }
        }
    }
    if (!(x - 3 < 0)) {
        this.dig(x-3,y);
    }
    if (!(x + 3 >= this._width)) {
        this.dig(x+3,y);
    }
    if (!(y - 3 < 0)) {
        this.dig(x,y-3);
    }
    if (!(y + 3 >= this._height)) {
        this.dig(x,y+3);
    }
};

Game.Map.prototype.dig = function(x, y) {
    // If the tile is diggable, update it to a floor
    if (this.getTile(x, y).isDiggable()) {
        this._tiles[x][y] = Game.Tile.rubbleTile;
    }
};

Game.Map.prototype.changeTile = function(x, y, template) {
    if (this._tiles[x][y] !== Game.Tile.floorTile) {return;}
    this._tiles[x][y] = template;
};

Game.Map.prototype.getRandomFloorPosition = function() {
    // Randomly generate a tile which is a floor
    var x, y;
    do {
        x = Math.floor(Math.random() * this._width);
        y = Math.floor(Math.random() * this._width);
    } while(!this.isEmptyFloor(x, y));
    return {x: x, y: y};
}

Game.Map.prototype.addEntity = function(entity) {
    // Update the entity's map
    entity.setMap(this);
    // Update the map with the entity's position
    this.updateEntityPosition(entity);
    // Check if this entity is an actor, and if so add them to the scheduler
    if (entity.hasMixin('Actor')) {
       this._scheduler.add(entity, true);
    }
}

Game.Map.prototype.addEntityAtRandomPosition = function(entity) {
    var position = this.getRandomFloorPosition();
    entity.setX(position.x);
    entity.setY(position.y);
    this.addEntity(entity);
}

Game.Map.prototype.removeEntity = function(entity) {
    // Remove the entity from the map
    var key = entity.getX() + ',' + entity.getY();
    if (this._entities[key] == entity) {
        delete this._entities[key];
    }
    // If the entity is an actor, remove them from the scheduler
    if (entity.hasMixin('Actor')) {
        this._scheduler.remove(entity);
    }
}

Game.Map.prototype.isEmptyFloor = function(x, y) {
    // Check if the tile is floor and also has no entity
    return this.getTile(x, y) == Game.Tile.floorTile &&
           !this.getEntityAt(x, y);
}

Game.Map.prototype.getEntitiesWithinRadius = function(centerX, centerY, radius) {
    results = [];
    // Determine our bounds
    var leftX = centerX - radius;
    var rightX = centerX + radius;
    var topY = centerY - radius;
    var bottomY = centerY + radius;
    // Iterate through our entities, adding any which are within the bounds
    for (var key in this._entities) {
        var entity = this._entities[key];
        if (entity.getX() >= leftX &&
            entity.getX() <= rightX && 
            entity.getY() >= topY &&
            entity.getY() <= bottomY) {
            results.push(entity);
        }
    }
    return results;
}

Game.Map.prototype.setupFov = function() {
    // Keep this in 'map' variable so that we don't lose it.
    var map = this;
    
    // We need to create a callback which figures out if light can pass through a given tile.
    map._fov = new ROT.FOV.DiscreteShadowcasting(function(x, y) {
        return !map.getTile(x, y).isBlockingLight();
    }, 
    {topology: 4}
    );
}

Game.Map.prototype.getFov = function() {
    return this._fov;
}

Game.Map.prototype._setupExploredArray = function() {
    for (var x = 0; x < this._width; x++) {
        this._explored[x] = new Array(this._height);
        for (var y = 0; y < this._height; y++) {
            this._explored[x][y] = false;
        }
    }
};

Game.Map.prototype.setExplored = function(x, y, state) {
    // Only update if the tile is within bounds
    if (this.getTile(x, y) !== Game.Tile.nullTile) {
        this._explored[x][y] = state;
    }
};

Game.Map.prototype.isExplored = function(x, y) {
    // Only return the value if within bounds
    if (this.getTile(x, y) !== Game.Tile.nullTile) {
        return this._explored[x][y];
    } else {
        return false;
    }
};

Game.Map.prototype.updateEntityPosition = function(entity, oldX, oldY) {
    // Delete the old key if it is the same entity and we have old positions.
    if (typeof(oldX) !=="undefined") {
        var oldKey = oldX + ',' + oldY;
        if (this._entities[oldKey] == entity) {
            delete this._entities[oldKey];
        }
    }
    // Make sure the entity's position is within bounds
    if (entity.getX() < 0 || entity.getX() >= this._width ||
        entity.getY() < 0 || entity.getY() >= this._height ) {
        throw new Error("Entity's position is out of bounds.");
    }
    // Sanity check to make sure there is no entity at the new position.
    var key = entity.getX() + ',' + entity.getY();
    if (this._entities[key]) {
        throw new Error('Tried to add an entity at an occupied position.');
    }
    // Add the entity to the table of entities
    this._entities[key] = entity;
};

Game.Map.prototype.getItemsAt = function(x, y) {
    return this._items[x + ',' + y];
};

Game.Map.prototype.setItemsAt = function(x, y, items) {
    // If our items array is empty, then delete the key from the table.
    var key = x + ',' + y;
    if (items.length === 0) {
        if (this._items[key]) {
            delete this._items[key];
        }
    } else {
        // Simply update the items at that key
        this._items[key] = items;
    }
};

Game.Map.prototype.addItem = function(x, y, item) {
    // If we already have items at that position, simply append the item to the list of items.
    var key = x + ',' + y;
    if (this._items[key]) {
        this._items[key].push(item);
    } else {
        this._items[key] = [item];
    }
};

Game.Map.prototype.addItemAtRandomPosition = function(item) {
    var position = this.getRandomFloorPosition();
    while (this.getItemsAt(position.x, position.y)){
        position = this.getRandomFloorPosition();
    }
    this.addItem(position.x, position.y, item);
};

Game.Map.prototype.addDynamicTile = function(tile, x, y) {
    // Update the tile's map
    tile.setMap(this);
    // Make sure the tile's position is within bounds
    if (x < 0 || x >= this._width || y < 0 || y >= this._height ) {
        throw new Error("Tile's position is out of bounds.");
    }
    // Add the tile to the table of tiles
    this._tiles[x][y] = tile;
    tile.setX(x);
    tile.setY(y);

    // Check if this tile is an actor, and if so add them to the scheduler
    if (tile.hasMixin('Actor')) {
       this._scheduler.add(tile, true);
    }
};

Game.Map.prototype.removeDynamicTile = function(tile) {
    // Remove the entity from the map
    var x = tile.getX();
    var y = tile.getY();
    if (this._tiles[x][y] === tile) {
        this._tiles[x][y] = Game.Tile.floorTile;
    }

    console.log("removing!");
    // If the entity is an actor, remove them from the scheduler
    if (tile.hasMixin('Actor')) {
        this._scheduler.remove(tile);
    }
}


Game.Map.prototype.cellGrow = function(list, tileType, numberOfTiles) {
    var growthCount = 0;
    var i = 0;
    var dynamic = 1;

    while (growthCount < numberOfTiles){
        var currentTile = list[i]
        if (currentTile === undefined){
            break;
        }
        var x = currentTile.x;
        var y = currentTile.y;

        if (this._tiles[x - 1][y] === Game.Tile.floorTile || this._tiles[x - 1][y] === Game.Tile.bloodTile || this._tiles[x - 1][y] === Game.Tile.grassTile) {
            this._tiles[x - 1][y] = tileType;
            if (dynamic){
                var tileObject = Game.DynamicTileRepository.create(tileType);
                this.addDynamicTile(tileObject, x -1, y);
            }
            list.push({x: x - 1, y: y});
            growthCount ++;
        }
        if (this._tiles[x + 1][y] === Game.Tile.floorTile || this._tiles[x + 1][y] === Game.Tile.bloodTile || this._tiles[x + 1][y] === Game.Tile.grassTile) {
            this._tiles[x + 1][y] = tileType;
            if (dynamic){
                var tileObject = Game.DynamicTileRepository.create(tileType);
                this.addDynamicTile(tileObject, x + 1, y);
            }
            list.push({x: x + 1, y: y});
            growthCount ++;
        }
        if (this._tiles[x][y - 1] === Game.Tile.floorTile || this._tiles[x][y - 1] === Game.Tile.bloodTile || this._tiles[x][y - 1] === Game.Tile.grassTile) {
            this._tiles[x][y -1]  = tileType;
            if (dynamic){
                var tileObject = Game.DynamicTileRepository.create(tileType);
                this.addDynamicTile(tileObject, x, y - 1);
            }
            list.push({x: x, y: y - 1});
            growthCount ++;
        }
        if (this._tiles[x][y + 1] === Game.Tile.floorTile || this._tiles[x][y + 1] === Game.Tile.bloodTile || this._tiles[x][y + 1] === Game.Tile.grassTile) {
            this._tiles[x][y + 1] = tileType;
            if (dynamic){
                var tileObject = Game.DynamicTileRepository.create(tileType);
                this.addDynamicTile(tileObject, x, y + 1);
            }
            list.push({x: x, y: y + 1});
            growthCount ++;
        }
        i++
    }
};