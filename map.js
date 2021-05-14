Game.Map = function(tiles, player, items, stairs, gasMap) {
    this._tiles = tiles;
    // cache the width and height based
    // on the length of the dimensions of
    // the tiles array
    this._width = tiles.length;
    this._height = tiles[0].length;
    this._stairs = stairs;
    // create a hash table which will hold the entities
    this._entities = {};
    // Create a table which will hold the items
    this._items = {};
    // create the engine and scheduler
    this._scheduler = new ROT.Scheduler.Speed();
    this._engine = new ROT.Engine(this._scheduler);
    // add the player
    this._player = player;
    this._gasMap = gasMap;
    this.addEntityAtRandomPosition(player, 0);

    //set up the field of vision
    this._fov = {};
    this.setupFov();

    //runes
    this.setRune('protectTile');
    this.setRune('protectTile');
    this.setRune('vulnerabilityTile');
    this.setRune('vulnerabilityTile');
    if (Game.getLevel() > 6){
        this.setRune('vulnerabilityTile');
        this.setRune('vulnerabilityTile');
    }

    // 15 entities per floor
    let entitiesPerArea = 10
    if (Game.getLevel() > 6){
        entitiesPerArea = 15;
    }
    if (Game.getLevel() > 11){
        entitiesPerArea = 22;
    }
    for (let i = 0; i < entitiesPerArea; i++) {
        // Add a random entity
        let randomEntity = Game.EntityRepository.createRandomByFrequency('L' + Game.getLevel())
        this.addEntityAtRandomPosition( randomEntity , 1);
        if (Game.getLevel() <= 3){
            this.addEntityAtRandomPosition(Game.EntityRepository.create("barrel"), 0);
        }
    }
    // if on L3, create one rat king
    if (Game.getLevel() === 3){
        this.addEntityAtRandomPosition(Game.EntityRepository.create('rat king'), 1);
    }
    // if on L6, create one toad queen
    if (Game.getLevel() === 6){
        this.addEntityAtRandomPosition(Game.EntityRepository.create('toad queen'), 1);
    }
    // if on L11, create one hydra
    if (Game.getLevel() === 11){
        this.addEntityAtRandomPosition(Game.EntityRepository.create('hydra'), 1);
    }
    // if on L13, create one vampire
    if (Game.getLevel() === 13){
        this.addEntityAtRandomPosition(Game.EntityRepository.create('vampire'), 1);
    }
    // if on L14, create one cerberus
    if (Game.getLevel() === 14){
        this.addEntityAtRandomPosition(Game.EntityRepository.create('cerberus'), 1);
    }
    // if on L17, create one lich
    if (Game.getLevel() === 17){
        this.addEntityAtRandomPosition(Game.EntityRepository.create('lich'), 1);
    }
    
    /*let emptyItemList = [];
    let emptyItemCount = {};
    for (let i =0; i < 1000; i++){
        emptyItemList.push(Game.ItemRepository.createRandomConstrained(Game.getLevel()));
        emptyItemList.sort();
    }
       
    for (let item of emptyItemList) {
        if( Object.keys(emptyItemCount).includes(item) ){
            emptyItemCount[item] = emptyItemCount[item] + 1;
        }  else {
            emptyItemCount[item] = 1;
        }
    }

    console.log(emptyItemCount);*/

    // Items per floor
    let itemsPerArea = 7
    if (Game.getLevel() > 3){
        itemsPerArea = 6;
    }
    if (Game.getLevel() > 6){
        itemsPerArea = 5;
    }
    if (Game.getLevel() > 11){
        itemsPerArea = 4;
    }
    
    for (let i = 0; i < itemsPerArea; i++) {
        // Add a random entity
        this.addItemAtRandomPosition(Game.ItemRepository.createRandomConstrained(Game.getLevel()));
    }

    this.addGatedItem();

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
Game.Map.prototype.getWalkableByStairs = function() {
    walkableByStairs = []
    let x = this._stairs.x
    let y = this._stairs.y
    
    if (this._tiles[x - 1][y].isWalkable()){
        walkableByStairs.push({
            x: x - 1,
            y: y
        }); 
    }
    if (this._tiles[x + 1][y].isWalkable()){
        walkableByStairs.push({
            x: x + 1,
            y: y
        }); 
    }
    if (this._tiles[x][y - 1].isWalkable()){
        walkableByStairs.push({
            x: x,
            y: y - 1
        }); 
    }
    if (this._tiles[x][y + 1].isWalkable()) {
        walkableByStairs.push({
            x: x,
            y: y + 1
        }); 
    }
    
    return walkableByStairs;
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

Game.Map.prototype.isInBounds = function(x, y){
    if (x < 0 || x >= this._width || y < 0 || y >= this._height) return 0;
    else return 1;
}

Game.Map.prototype.addGatedItem = function() {
    const randNum = Math.random()*100;
    let chosenItem = ''
    let alreadyGotList = Game.Screen.playScreen.alreadyGotList;
    if (alreadyGotList.length === 3 || alreadyGotList.length === 0){
        if ( randNum > 66){
            chosenItem = 'strength potion';
        } else if (randNum > 33) {
            chosenItem = 'altar';
        } else {
            chosenItem = 'life potion';
        }
        Game.Screen.playScreen.alreadyGotList = [];
        Game.Screen.playScreen.alreadyGotList.push(chosenItem)
    } else if (alreadyGotList.length === 2){
        //find the missing item
        if (!alreadyGotList.includes("strength potion")) chosenItem = 'strength potion';
        else if (!alreadyGotList.includes("altar")) chosenItem = 'altar';
        else if (!alreadyGotList.includes("life potion")) chosenItem = 'life potion';
        Game.Screen.playScreen.alreadyGotList.push(chosenItem);
    } else if (alreadyGotList.length === 1){
        //find the missing two, use those on a 50% chance
        if (alreadyGotList.includes("altar")){
            firstOption = 'strength potion';
            secondOption = 'life potion';
        } else if (alreadyGotList.includes("strength potion")){
            firstOption = 'altar';
            secondOption = 'life potion';
        } else if (alreadyGotList.includes("life potion")){
            firstOption = 'strength potion';
            secondOption = 'altar';
        }
        chosenItem = (randNum > 50) ? firstOption : secondOption;
        Game.Screen.playScreen.alreadyGotList.push(chosenItem);
    }

    this.spawnGatedItem(chosenItem);
};

Game.Map.prototype.spawnGatedItem = function(in_string) {
    if (in_string === 'altar'){
        let floorPosition = this.getRandomFloorPosition();
        this._tiles[floorPosition.x][floorPosition.y] = Game.Tile.altarTile;
    } else {
        this.addItemAtRandomPosition(Game.GatedItemRepository.create(in_string));
    }
};

Game.Map.prototype.cleanUpDoors = function(){
    let doorList = this.getAllTlesOfType(Game.Tile.doorTile);

    for (let door of doorList){
        if (this.checkAdjacentNumber(door.x, door.y, Game.Tile.wallTile) !== 2){
            this._tiles[door.x][door.y] = Game.Tile.floorTile;
            //console.log('changing door');
        }
    }
}

Game.Map.prototype.deleteHalfOfDoors = function(){
    let doorList = this.getAllTlesOfType(Game.Tile.doorTile);
    let doorsToDelete = Math.floor(doorList.length/2);

    for (let i = 0; i < doorsToDelete; i++){
        let door = Game.pickRandomElement(doorList)
        this._tiles[door.x][door.y] = Game.Tile.floorTile;
    }
}

Game.Map.prototype.getAllTlesOfType = function(tileType){
    let tileTypeList = [];
    let rowCount = 0;
    let columnCount = 0;
    for (let row of this._tiles) {
        columnCount = 0;
        for (let tile of row){
            if (tile === tileType){
                tileTypeList.push(
                    {
                        x: rowCount,
                        y: columnCount
                    }
                )
            }
            columnCount++;
        }
        rowCount++;
    }

    return tileTypeList;
}

Game.Map.prototype.checkAdjacentNumber = function(x,y,tileType) {
    let adjacentCount = 0;
    
    if (this._tiles[x - 1][y]  === tileType){
        adjacentCount++;
    }
    if (this._tiles[x + 1][y]  === tileType){
        adjacentCount++;
    }
    if (this._tiles[x][y - 1]  === tileType){
        adjacentCount++;
    }
    if (this._tiles[x][y + 1]  === tileType) {
        adjacentCount++;
    } 
    
    return adjacentCount;
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
                    if (this._entities[key] !== undefined && this._entities[key] !== null && this._entities[key].getName() !== 'barrel') {
                        roomMatters = true;
                    }
                    //check for items
                    if (this.getItemsAt(x,y) !== undefined){
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
    if (!this.isInBounds(x, y)) {
        return Game.Tile.nullTile;
    } else {
        return this._tiles[x][y] || Game.Tile.nullTile;
    }
};

// Set the tile for a given coordinate set
Game.Map.prototype.setTile = function(x, y, tileType) {
    // Make sure we are inside the bounds. If we aren't, return
    // null tile.
    if (!this.isInBounds(x, y)) {
        console.log('out of bounds!');
    } else {
        this._tiles[x][y] = tileType;
    }
};

// Gets the tile for a given coordinate set
Game.Map.prototype.getGas = function(x, y) {
    // Make sure we are inside the bounds. If we aren't, return
    // null tile.
    if (!this.isInBounds(x, y)) {
        return  null;
    } else {
        return this._gasMap[x][y] || null;
    }
};


// Gets the full tile array
Game.Map.prototype.getTiles = function() {
    return this._tiles;
};

Game.Map.prototype.shatter = function(x, y) {
    for (let i = x-2; i <= x + 2; i++){
        for (let j = y-2; j <= y+2; j++){
            if (!(i < 1 || i >= this._width - 1 || j < 1 || j >= this._height - 1)) {
                this.dig(i,j);
            }
        }
    }
    if (!(x - 3 < 1)) {
        this.dig(x-3,y);
    }
    if (!(x + 3 >= this._width - 1)) {
        this.dig(x+3,y);
    }
    if (!(y - 3 < 1)) {
        this.dig(x,y-3);
    }
    if (!(y + 3 >= this._height - 1)) {
        this.dig(x,y+3);
    }
};

Game.Map.prototype.dig = function(x, y) {
    // If the tile is diggable, update it to a floor
    if (this.getTile(x, y).isDiggable()) {
        this._tiles[x][y] = Game.Tile.rubbleTile;
    }
    const entity = this.getEntityAt(x, y);
    if (entity){
        if (entity.isNotMonster() || entity.getName() === 'golem'){
            entity.takeDamage(entity, 50, false);
        }
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

Game.Map.prototype.setRunePosition = function(runeName, x, y){
    let tileObject = Game.DynamicTileRepository.create(runeName);
    this.addDynamicTile(tileObject, x, y);
}

Game.Map.prototype.setRune = function(runeName) {
    let matches = [];
    // Iterate through all tiles, checking if they are floor tiles. 
    for (let x = 0; x < this._width; x++) {
        for (let y = 0; y < this._height; y++) {
            if (this._tiles[x][y]  == Game.Tile.floorTile) {
                matches.push({x: x, y: y});
            }
        }
    }
    // We shuffle the list of matches to prevent bias
    let match =  Game.pickRandomElement(matches);
    this.setRunePosition(runeName, match.x, match.y);
    
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
        var gas = map.getGas(x,y);
        return !map.getTile(x,y).isBlockingLight() && (gas === null || !gas.isBlockingLight());
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
    if (!this.isInBounds(entity.getX(), entity.getY())) {
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

//find a tile with not item on it
Game.Map.prototype.findFreeTile = function(x, y){
    let radius = 0;
    let maxRadius = 4;
    while (radius <= maxRadius){
        // Iterate through our tiles, escaping for the first one that is item-free

        // Do the cross first
        for (let i = 0 - radius; i <= radius; i++) {
            let items = this._items[(x + i) + ',' + y];
            if ( (items === undefined || items.length === 0) && this.isInBounds(x + i, y) && this._tiles[x+i][y].isWalkable()){
                // catch the edge case of the starting tile not having a path to itself
                if (radius === 0 ||this.checkPathLength(x, y, x + i, y, maxRadius*2)){
                    return {
                        x: x + i,
                        y: y
                    };
                }
            } 
        }
        for (let j = 0 - radius; j <= radius; j++) {
            let items = this._items[x + ',' + (y + j)];
            if ( (items === undefined || items.length === 0) && this.isInBounds(x, y + j) && this._tiles[x][y+j].isWalkable()){
                if (this.checkPathLength(x, y, x, y + j, maxRadius*2)){
                    return {
                        x: x,
                        y: y + j
                    };
                }
            } 
        }

        //Then the rest of the cells in the current radius
        for (let i = 0 - radius; i <= radius; i++) {
            for (let j = 0 - radius; j <= radius; j++){
                let items = this._items[(x + i) + ',' + (y + j)];
                if ( (items === undefined || items.length === 0) && this.isInBounds(x + i, y + j) && this._tiles[x+i][y+j].isWalkable()){
                    if (this.checkPathLength(x, y, x + i, y + j, maxRadius*2)){
                        return {
                            x: x + i,
                            y: y + j
                        };
                    }
                } 
            }
        }
        radius ++;
    }   
    //last resort is a stack
    return {x:x, y:y}; 
}

Game.Map.prototype.checkPathLength = function(sourceX, sourceY, targetX, targetY, pathLength) {  
    var thisRef = this;
    var path = new ROT.Path.AStar(targetX, targetY, function(x, y) {
        return thisRef.getTile(x, y).isWalkable();
    }, {topology: 4});
    // Once we've gotten the path, we want to move to the second cell that is passed in the callback (the first is the entity's starting point)

    path.compute(sourceX, sourceY, function(x, y) {});
                    
    //If we can get there, go to it
    if(path._todo.length > 0 && path._todo.length <= pathLength){
        return true;
    }

    return false;
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
    this.addCell(tile, x, y, true);

    // Check if this tile is an actor, and if so add them to the scheduler
    if (tile.hasMixin('Actor')) {
       this._scheduler.add(tile, true);
    }
};

Game.Map.prototype.addGas = function(gas, x, y) {
    this.addCell(gas, x, y, false);

    // Add gas to the scheduler
    this._scheduler.add(gas, true);
};

Game.Map.prototype.addCell = function (cell, x, y, isTile){
    cell.setMap(this);
    // Make sure the cell's position is within bounds
    if (!this.isInBounds(x,y)) {
        throw new Error("Cell's position is out of bounds.");
    }
    // Add the cell to the table of cells (tiles or gas)
    if (isTile) {
        this._tiles[x][y] = cell;
    } else {
        this._gasMap[x][y] = cell;
    }

    cell.setX(x);
    cell.setY(y);
}

Game.Map.prototype.removeDynamicTile = function(tile) {
    // Remove the dynamic tile from the map
    let x = tile.getX();
    let y = tile.getY();
    if (this._tiles[x][y] === tile) {
        this._tiles[x][y] = Game.Tile.floorTile;
    }

    // If the entity is an actor, remove them from the scheduler
    if (tile.hasMixin('Actor')) {
        this._scheduler.remove(tile);
    }
}

Game.Map.prototype.removeGas = function(gas) {
    // Remove the gas from the map
    let x = gas.getX();
    let y = gas.getY();
    if (this._gasMap[x][y] === gas) {
        this._gasMap[x][y] = null;
    }

    // Remove them from the scheduler
    this._scheduler.remove(gas);
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

    while (growthCount < numberOfTiles){
        let currentTile = list[i]
        if (currentTile === undefined){
            break;
        }
        let x = currentTile.x;
        let y = currentTile.y;

        if (this._tiles[x - 1][y] === Game.Tile.floorTile || this._tiles[x - 1][y] === Game.Tile.bloodTile || this._tiles[x - 1][y] === Game.Tile.grassTile || this._tiles[x - 1][y] === Game.Tile.rubbleTile || this._tiles[x - 1][y] === Game.Tile.openDoorTile) {
            this._tiles[x - 1][y] = tileType;
            let tileObject = Game.DynamicTileRepository.create(tileType);
            this.addDynamicTile(tileObject, x -1, y);
            list.push({x: x - 1, y: y});
            growthCount ++;
        }
        if (this._tiles[x + 1][y] === Game.Tile.floorTile || this._tiles[x + 1][y] === Game.Tile.bloodTile || this._tiles[x + 1][y] === Game.Tile.grassTile || this._tiles[x + 1][y] === Game.Tile.rubbleTile || this._tiles[x + 1][y] === Game.Tile.openDoorTile) {
            this._tiles[x + 1][y] = tileType;
            let tileObject = Game.DynamicTileRepository.create(tileType);
            this.addDynamicTile(tileObject, x + 1, y);
            list.push({x: x + 1, y: y});
            growthCount ++;
        }
        if (this._tiles[x][y - 1] === Game.Tile.floorTile || this._tiles[x][y - 1] === Game.Tile.bloodTile || this._tiles[x][y - 1] === Game.Tile.grassTile || this._tiles[x][y - 1] === Game.Tile.rubbleTile || this._tiles[x][y - 1] === Game.Tile.openDoorTile) {
            this._tiles[x][y -1]  = tileType;
            let tileObject = Game.DynamicTileRepository.create(tileType);
            this.addDynamicTile(tileObject, x, y - 1);
            list.push({x: x, y: y - 1});
            growthCount ++;
        }
        if (this._tiles[x][y + 1] === Game.Tile.floorTile || this._tiles[x][y + 1] === Game.Tile.bloodTile || this._tiles[x][y + 1] === Game.Tile.grassTile || this._tiles[x][y + 1] === Game.Tile.rubbleTile || this._tiles[x][y + 1] === Game.Tile.openDoorTile) {
            this._tiles[x][y + 1] = tileType;
            let tileObject = Game.DynamicTileRepository.create(tileType);
            this.addDynamicTile(tileObject, x, y + 1);
            list.push({x: x, y: y + 1});
            growthCount ++;
        }
        i++
    }
};

Game.Map.prototype.gasGrow = function(list, gasType, numberOfCells) {
    let growthCount = 0;
    let i = 0;

    while (growthCount < numberOfCells){
        let currentTile = list[i]
        if (currentTile === undefined){
            break;
        }
        let x = currentTile.x;
        let y = currentTile.y;

        if (this._tiles[x - 1][y] !== Game.Tile.wallTile && this._tiles[x - 1][y] !== Game.Tile.doorTile) {
            this._gasMap[x - 1][y] = gasType;
            let gasObject = Game.GasRepository.create(gasType);
            this.addGas(gasObject, x -1, y);
            list.push({x: x - 1, y: y});
            growthCount++;
        }
        if (this._tiles[x + 1][y] !== Game.Tile.wallTile && this._tiles[x + 1][y] !== Game.Tile.doorTile) {
            this._gasMap[x + 1][y] = gasType;
            let gasObject = Game.GasRepository.create(gasType);
            this.addGas(gasObject, x + 1, y);
            list.push({x: x + 1, y: y});
            growthCount++;
        }
        if (this._tiles[x][y - 1] !== Game.Tile.wallTile && this._tiles[x][y - 1] !== Game.Tile.doorTile) {
            this._gasMap[x][y -1]  = gasType;
            let gasObject = Game.GasRepository.create(gasType);
            this.addGas(gasObject, x, y - 1);
            list.push({x: x, y: y - 1});
            growthCount++;
        }
        if (this._tiles[x][y + 1] !== Game.Tile.wallTile && this._tiles[x][y + 1] !== Game.Tile.doorTile) {
            this._gasMap[x][y + 1] = gasType;
            let gasObject = Game.GasRepository.create(gasType);
            this.addGas(gasObject, x, y + 1);
            list.push({x: x, y: y + 1});
            growthCount++;
        }
        i++
    }
};