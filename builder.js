Game.Builder = function(width, height, level) {
    this._width = width;
    this._height = height;
    this._tiles = {};
    this._regions = {};

    // Create a new cave at each level
    this._tiles = this._generateLevel(level);
    // Setup the regions array for each depth
    this._regions = new Array(width);
    for (let x = 0; x < width; x++) {
        this._regions[x] = new Array(height);
        // Fill with zeroes
        for (let y = 0; y < height; y++) {
            this._regions[x][y] = 0;
        }
    }

    let grassAmount = 2;
    let columnAmount = 20;
    let shallowWaterAmount = 6;
    if (level <= 3){
        for (let i = 0; i < grassAmount; i++){
            this._setGrass();
        }
        for (let i = 0; i < columnAmount; i++){
            this._setColumn();
        }
    }
    this._setGrass();
    this._setGrass();
    this._setFerns();
    this._setFerns();
    //TO DO: Mines offshoot
    if (level > 3){
        for (let i = 0; i < shallowWaterAmount; i++){
            this._setShallowWater();
        }
    }
    this._setStairs(level);
};

Game.Builder.prototype.getTiles = function () {
    return this._tiles;
}
Game.Builder.prototype.getWidth = function () {
    return this._width;
}
Game.Builder.prototype.getHeight = function () {
    return this._height;
}

Game.Builder.prototype._generateLevel = function(level) {
    // Create the empty map
    let map = new Array(this._width);
    let options = {};
    let generator = {};
    for (let w = 0; w < this._width; w++) {
        map[w] = new Array(this._height);
    }

    let setMapTile = function (x, y, value) {
        if (value === 1) {
           map[x][y] = Game.Tile.wallTile;
       } else {
           map[x][y] = Game.Tile.floorTile;
       }       
   }

    if (level <= 3){
        // Set up the level generator
        options = {
            roomWidth: [4, 15],
            roomHeight: [4, 10],
            corridorLength: [0, 0],
            dugPercentage: 0.50
        }
        generator = new ROT.Map.Digger(this._width, this._height, options);

    } else if (level > 3 && level <=6){
         // Set up the level generator
        options = {
            roomWidth: [5, 20],
            roomHeight: [5, 12],
            corridorLength: [0, 4],
            dugPercentage: 0.45
        }
        generator = new ROT.Map.Digger(this._width, this._height, options);
    } else if (level > 6){
        setMapTile = function (x, y, value) {
            if (value === 0) {
               map[x][y] = Game.Tile.wallTile;
           } else {
               map[x][y] = Game.Tile.floorTile;
           }       
       }
        // Set up the level generator
       generator = new ROT.Map.Cellular(this._width - 1, this._height - 1);
       generator.randomize(0.5);
    }
   

    if (level <=6){
        generator.create(setMapTile);

        let makeDoor = function(x, y) {
            map[x][y] = Game.Tile.doorTile;
        }
        
        let rooms = generator.getRooms();
        for (let room of rooms) {
            //console.log(room.clearDoors());
            room.getDoors(makeDoor);
        }
    } else {
        generator.create(setMapTile);
        generator.create(setMapTile);
        generator.create(setMapTile);
        generator.create(setMapTile);
        generator.create(setMapTile);
        generator.connect(setMapTile, 1);
        map = this._makeBorder(map);
    }
    
    return map;
};

Game.Builder.prototype._canFillRegion = function(x, y) {
    // Make sure the tile is within bounds
    if (x < 0 || y < 0 || x >= this._width || y >= this._height) {
        return false;
    }
    // Make sure the tile does not already have a region
    if (this._regions[x][y] != 0) {
        return false;
    }
    // Make sure the tile is walkable
    return this._tiles[x][y].isWalkable();
}

Game.Builder.prototype._fillRegion = function(region, x, y) {
    let tilesFilled = 1;
    let tiles = [{x:x, y:y}];
    let tile;
    let neighbors;
    // Update the region of the original tile
    this._regions[x][y] = region;
    // Keep looping while we still have tiles to process
    while (tiles.length > 0) {
        tile = tiles.pop();
        // Get the neighbors of the tile
        neighbors = tile.getNeighborPositions();
        // Iterate through each neighbor, checking if we can use it to fill
        // and if so updating the region and adding it to our processing
        // list.
        while (neighbors.length > 0) {
            tile = neighbors.pop();
            if (this._canFillRegion(tile.x, tile.y)) {
                this._regions[tile.x][tile.y] = region;
                tiles.push(tile);
                tilesFilled++;
            }
        }

    }
    return tilesFilled;
}

// This removes all tiles at a given depth level with a region number.
// It fills the tiles with a wall tile.
Game.Builder.prototype._removeRegion = function(region) {
    for (let x = 0; x < this._width; x++) {
        for (let y = 0; y < this._height; y++) {
            if (this._regions[x][y] == region) {
                // Clear the region and set the tile to a wall tile
                this._regions[x][y] = 0;
                this._tiles[x][y] = Game.Tile.wallTile;
            }
        }
    }
}

// This sets up the regions for the current floor
Game.Builder.prototype._setupRegions = function() {
    let region = 1;
    let tilesFilled;
    // Iterate through all tiles searching for a tile that can be used as the starting point for a flood fill
    for (let x = 0; x < this._width; x++) {
        for (let y = 0; y < this._height; y++) {
            if (this._canFillRegion(x, y)) {
                // Try to fill
                tilesFilled = this._fillRegion(region, x, y);
                // If it was too small, simply remove it
                if (tilesFilled <= 20) {
                    this._removeRegion(region);
                } else {
                    region++;
                }
            }
        }
    }
}

// Generates stairs at a free location
Game.Builder.prototype._setStairs = function(levelNumber) {
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
    while (true){
        let match =  matches[Math.floor(Math.random() * matches.length)];
        if(this._checkAdjacent(match.x, match.y, Game.Tile.floorTile)){
            if (levelNumber != 3 && levelNumber != 6 && levelNumber != 11){
                this._tiles[match.x][match.y] = Game.Tile.stairsDownTile;
            } else {
                this._tiles[match.x][match.y] = Game.Tile.stairsDownTileLocked;
            }
            
            break
        }
    }
}

// Generates grass at free locations
Game.Builder.prototype._setGrass = function() {
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
    let match =  matches[Math.floor(Math.random() * matches.length)];
    let grassList = [];
    grassList.push(match);
    this._cellGrow(grassList, Game.Tile.grassTile, 20)
}

// Generates grass at free locations
Game.Builder.prototype._setFerns = function() {
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
    let match =  matches[Math.floor(Math.random() * matches.length)];
    let grassList = [];
    grassList.push(match);
    this._cellGrow(grassList, Game.Tile.fernTile, 20)
}

// Generates grass at free locations
Game.Builder.prototype._setShallowWater = function() {
    let matches = [];
    let match;
    let waterList = [];
    // Iterate through all tiles, checking if they are floor tiles. 
    for (let x = 0; x < this._width; x++) {
        for (let y = 0; y < this._height; y++) {
            if (this._tiles[x][y]  == Game.Tile.floorTile) {
                matches.push({x: x, y: y});
            }
        }
    }
    // We shuffle the list of matches to prevent bias
    match = matches[Math.floor(Math.random() * matches.length)];
    waterList.push(match);
    this._cellGrow(waterList, Game.Tile.shallowWaterTile, 20)
}

// Generates grass at free locations
Game.Builder.prototype._setColumn = function() {
    let matches = [];
    let match;
    // Iterate through all tiles, checking if they are floor tiles. 
    for (let x = 0; x < this._width; x++) {
        for (let y = 0; y < this._height; y++) {
            if (this._tiles[x][y]  == Game.Tile.floorTile) {
                matches.push({x: x, y: y});
            }
        }
    }
    // We shuffle the list of matches to prevent bias
    match = matches[Math.floor(Math.random() * matches.length)];
    console.log(match);
    matchX = match.x;
    matchY = match.y;
    if(this._checkAdjacent(matchX, matchY, Game.Tile.floorTile)){
        this._tiles[matchX][matchY] = Game.Tile.wallTile;
    }
}

Game.Builder.prototype._checkAdjacent = function(x,y,tileType) {
    if (this._tiles[x - 1][y]  === tileType && this._tiles[x + 1][y]  === tileType
        && this._tiles[x][y - 1]  === tileType && this._tiles[x][y + 1]  === tileType) {
            return true;
    } else {
        return false;
    }
}

// Generates tileType at free locations
Game.Builder.prototype._cellGrow = function(list, tileType, numberOfTiles) {
    let growthCount = 0;
    let i = 0;
    while (growthCount < numberOfTiles){
        let currentTile = list[i]
        if (currentTile === undefined){
            break;
        }
        let x = currentTile.x;
        let y = currentTile.y;

        if (this._tiles[x - 1][y]  === Game.Tile.floorTile) {
            this._tiles[x - 1][y]  = tileType;
            list.push({x: x - 1, y: y});
            growthCount ++;
        }
        if (this._tiles[x + 1][y]  === Game.Tile.floorTile) {
            this._tiles[x + 1][y]  = tileType;
            list.push({x: x + 1, y: y});
            growthCount ++;
        }
        if (this._tiles[x][y - 1]  === Game.Tile.floorTile) {
            this._tiles[x][y -1]  = tileType;
            list.push({x: x, y: y - 1});
            growthCount ++;
        }
        if (this._tiles[x][y + 1]  === Game.Tile.floorTile) {
            this._tiles[x][y + 1]  = tileType;
            list.push({x: x, y: y + 1});
            growthCount ++;
        }
        i++
    }
}

Game.Builder.prototype._makeBorder = function(map) {
    // Iterate through all tiles, checking if they are floor tiles. 
    for (let x = 0; x < this._width; x++) {
        for (let y = 0; y < this._height; y++) {
            if (x == 0 || y == 0 || x == this._width - 1 || y == this._height - 1) {
                map[x][y] = Game.Tile.wallTile;
            }
        }
    }

    return map;
}
