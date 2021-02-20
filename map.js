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
    this.addEntityAtRandomPosition(player, 0);

    //set up the field of vision
    this._fov = {};
    this.setupFov();

    // 15 entities per floor
    for (let i = 0; i < 10; i++) {
        // Add a random entity
        let randomEntity = Game.EntityRepository.createRandomByFrequency('L' + Game.getLevel())
        this.addEntityAtRandomPosition( randomEntity , 1);
        this.addEntityAtRandomPosition(Game.EntityRepository.create("barrel"), 0);
    }
    // if on L3, create one rat king
    if (Game.getLevel() === 3){
        this.addEntityAtRandomPosition(Game.EntityRepository.create('rat king'), 1);
    }
    // if on L6, create one toad queen
    if (Game.getLevel() === 6){
        this.addEntityAtRandomPosition(Game.EntityRepository.create('toad queen'), 1);
    }
    // if on L11, create one toad queen
    if (Game.getLevel() === 11){
        this.addEntityAtRandomPosition(Game.EntityRepository.create('hydra'), 1);
    }
    
    let emptyItemList = [];
    let emptyItemCount = {};
    for (let i =0; i < 10000; i++){
        emptyItemList.push(Game.ItemRepository.createRandomConstrained(Game.getLevel())._name);
        emptyItemList.sort();
    }
       
    for (let item of emptyItemList) {
        if( Object.keys(emptyItemCount).includes(item) ){
            emptyItemCount[item] = emptyItemCount[item] + 1;
        }  else {
            emptyItemCount[item] = 1;
        }
    }

    console.log(emptyItemCount);

    // 15 items per floor
    for (let i = 0; i < 9; i++) {
        // Add a random entity
        this.addItemAtRandomPosition(Game.ItemRepository.createRandomConstrained(Game.getLevel()));
    }
    this.addItemAtRandomPosition(Game.GatedItemRepository.createRandom());
    
    // Add weapons and armor to the map in random positions
    /*var templates = ['dagger', 'axe', 'dart', 'sword', 'spear', 'leather', 'scalemail', 'chainmail', 'platemail'];
    for (var i = 0; i < templates.length; i++) {
        this.addItemAtRandomPosition(Game.ItemRepository.create(templates[i]));
    }*/
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

Game.Map.prototype.getRidOfBoringRooms = function (rooms) {
    for (room of rooms){
        if (Object.keys(room._doors).length === 1){
            let left = room.getLeft();
            let right = room.getRight();
            let top = room.getTop();
            let bottom = room.getBottom();
            let roomMatters = false;
            for (let x = left; x <= right; x++){
                for (let y = top; y <= bottom; y ++){
                    //check for stairs
                    if (this._tiles[x][y] === Game.Tile.stairsDownTile || this._tiles[x][y] === Game.Tile.stairsDownTileLocked){
                        roomMatters = true;
                    }
                    //check for entities
                    const key = x + ',' + y;
                    if (this._entities[key] !== undefined && this._entities[key] !== null) {
                        roomMatters = true;
                    }
                    //check for items
                    if (this.getItemsAt(x,y) !== undefined && this._entities[key] !== null){
                        roomMatters = true;
                    } 
                }
            }
            if (roomMatters === false) {
                for (let x = left; x <= right; x++){
                    for (let y = top; y <= bottom; y ++){
                        this._tiles[x][y] = Game.Tile.wallTile;
                    }
                } 
                for (let key in room._doors){
                    let xy = key.split(",");
                    let x = xy[0];
                    let y = xy[1];
                    this._tiles[Number(x)][Number(y)] = Game.Tile.wallTile;
                }
            }
        }
    }
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
    for (let i = x-2; i <= x + 2; i++){
        for (let j = y-2; j <= y+2; j++){
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
    // Randomly choose a tile which is a floor
    let x, y;
    do {
        x = Math.floor(Math.random() * this._width);
        y = Math.floor(Math.random() * this._width);
    } while(!this.isEmptyTileOfType(x, y, Game.Tile.floorTile));
    return {x: x, y: y};
}


Game.Map.prototype.getRandomWaterPosition = function() {
    // Randomly choose a tile which is water
    let x, y;
    do {
        x = Math.floor(Math.random() * this._width);
        y = Math.floor(Math.random() * this._width);
    } while(!this.isEmptyTileOfType(x, y, Game.Tile.shallowWaterTile));
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

//adds and entity on an empty floor tile
Game.Map.prototype.addEntityAtRandomPosition = function(entity, outOfSightline) {
    let isSwimmer = entity.hasMixin('Swimmer');
    let position = isSwimmer ? this.getRandomWaterPosition() : this.getRandomFloorPosition();
    if (outOfSightline){
        // Cache the FOV
        let visibleCells = {};
        this.getFov().compute(
            this._player.getX(), this._player.getY(), 
            this._player.getSightRadius(), 
            function(x, y, radius, visibility) {
                visibleCells[x + "," + y] = true;
            }
        );
        while (visibleCells[String(position.x) + ',' + String(position.y)] === true){
            position = isSwimmer ? this.getRandomWaterPosition() : this.getRandomFloorPosition();
        }
    }
    entity.setX(position.x);
    entity.setY(position.y);
    this.addEntity(entity);
}

Game.Map.prototype.removeEntity = function(entity) {
    // Remove the entity from the map
    const key = entity.getX() + ',' + entity.getY();
    if (this._entities[key] == entity) {
        delete this._entities[key];
    }
    // If the entity is an actor, remove them from the scheduler
    if (entity.hasMixin('Actor')) {
        this._scheduler.remove(entity);
    }
}

Game.Map.prototype.isEmptyTileOfType = function(x, y, tileType) {
    // Check if the tile is of a certain type and also has no entity
    return this.getTile(x, y) == tileType &&
           !this.getEntityAt(x, y);
}

Game.Map.prototype.getEntitiesWithinRadius = function(centerX, centerY, radius) {
    results = [];
    // Determine our bounds
    const leftX = centerX - radius;
    const rightX = centerX + radius;
    const topY = centerY - radius;
    const bottomY = centerY + radius;
    // Iterate through our entities, adding any which are within the bounds
    for (let key in this._entities) {
        let entity = this._entities[key];
        if (entity.getX() >= leftX &&
            entity.getX() <= rightX && 
            entity.getY() >= topY &&
            entity.getY() <= bottomY) {
            results.push(entity);
        }
    }
    return results;
}

Game.Map.prototype.sortByDistance = function(x,y,locationArray) {
    let locationDistance = [];
    for (let location of locationArray){
        let distance = Math.abs(x - location.x) + Math.abs(y - location.y)
        locationDistance.push({
            x: location.x,
            y: location.y,
            distance: distance
        })
    }
    locationDistance.sort(function(a, b){return a.distance - b.distance;});
    return locationDistance;
}

Game.Map.prototype.setupFov = function() {
    // Keep this in 'map' variable so that we don't lose it.
    let map = this;
    
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
    for (let x = 0; x < this._width; x++) {
        this._explored[x] = new Array(this._height);
        for (let y = 0; y < this._height; y++) {
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
        let oldKey = oldX + ',' + oldY;
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
    let key = entity.getX() + ',' + entity.getY();
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
    let key = x + ',' + y;
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
    let key = x + ',' + y;
    if (this._items[key]) {
        this._items[key].push(item);
    } else {
        this._items[key] = [item];
    }
};

Game.Map.prototype.addItemAtRandomPosition = function(item) {
    let position = this.getRandomFloorPosition();
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
    let x = tile.getX();
    let y = tile.getY();
    if (this._tiles[x][y] === tile) {
        this._tiles[x][y] = Game.Tile.floorTile;
    }

    console.log("removing!");
    // If the entity is an actor, remove them from the scheduler
    if (tile.hasMixin('Actor')) {
        this._scheduler.remove(tile);
    }
}

Game.Map.prototype.areHunters = function() {
    let nearbyEntities = [];
    nearbyEntities = this.getEntitiesWithinRadius(this._player.getX(),this._player.getY(),16)
    // Remove the entity from the map
    if (nearbyEntities.length === 0) {
        return false;
    }
    for (let entity of nearbyEntities){
        if (entity.hasMixin('TaskActor')){
            if (entity._hunting){
                return true;
            }
        }
    }
    return false;
}

Game.Map.prototype.cellGrow = function(list, tileType, numberOfTiles) {
    let growthCount = 0;
    let i = 0;
    let dynamic = 1;

    while (growthCount < numberOfTiles){
        let currentTile = list[i]
        if (currentTile === undefined){
            break;
        }
        let x = currentTile.x;
        let y = currentTile.y;

        if (this._tiles[x - 1][y] === Game.Tile.floorTile || this._tiles[x - 1][y] === Game.Tile.bloodTile || this._tiles[x - 1][y] === Game.Tile.grassTile) {
            this._tiles[x - 1][y] = tileType;
            if (dynamic){
                let tileObject = Game.DynamicTileRepository.create(tileType);
                this.addDynamicTile(tileObject, x -1, y);
            }
            list.push({x: x - 1, y: y});
            growthCount ++;
        }
        if (this._tiles[x + 1][y] === Game.Tile.floorTile || this._tiles[x + 1][y] === Game.Tile.bloodTile || this._tiles[x + 1][y] === Game.Tile.grassTile) {
            this._tiles[x + 1][y] = tileType;
            if (dynamic){
                let tileObject = Game.DynamicTileRepository.create(tileType);
                this.addDynamicTile(tileObject, x + 1, y);
            }
            list.push({x: x + 1, y: y});
            growthCount ++;
        }
        if (this._tiles[x][y - 1] === Game.Tile.floorTile || this._tiles[x][y - 1] === Game.Tile.bloodTile || this._tiles[x][y - 1] === Game.Tile.grassTile) {
            this._tiles[x][y -1]  = tileType;
            if (dynamic){
                let tileObject = Game.DynamicTileRepository.create(tileType);
                this.addDynamicTile(tileObject, x, y - 1);
            }
            list.push({x: x, y: y - 1});
            growthCount ++;
        }
        if (this._tiles[x][y + 1] === Game.Tile.floorTile || this._tiles[x][y + 1] === Game.Tile.bloodTile || this._tiles[x][y + 1] === Game.Tile.grassTile) {
            this._tiles[x][y + 1] = tileType;
            if (dynamic){
                let tileObject = Game.DynamicTileRepository.create(tileType);
                this.addDynamicTile(tileObject, x, y + 1);
            }
            list.push({x: x, y: y + 1});
            growthCount ++;
        }
        i++
    }
};