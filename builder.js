Game.Builder = function(width, height) {
    this._width = width;
    this._height = height;
    this._tiles = {};
    this._regions = {};

    // Create a new cave at each level
    this._tiles = this._generateLevel();
    // Setup the regions array for each depth
    this._regions = new Array(width);
    for (var x = 0; x < width; x++) {
        this._regions[x] = new Array(height);
        // Fill with zeroes
        for (var y = 0; y < height; y++) {
            this._regions[x][y] = 0;
        }
    }

    this._setupRegions();
    this._setBarrel();
    this._setBarrel();
    this._setBarrel();
    this._setGrass();
    this._setGrass();
    this._setGrass();
    this._setGrass();
    this._setShallowWater();
    this._setShallowWater();
    this._setStairs();
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

Game.Builder.prototype._generateLevel = function() {
    // Create the empty map
    var map = new Array(this._width);
    for (var w = 0; w < this._width; w++) {
        map[w] = new Array(this._height);
    }
    // Setup the cave generator
    var options = {
        roomWidth: [5, 20],
        roomHeight: [3, 12],
        corridorLength: [0, 3],
        dugPercentage: 0.7
    }
    var generator = new ROT.Map.Digger(this._width, this._height, options);
    var setMapTile = function (x, y, value) {
         if (value === 1) {
            map[x][y] = Game.Tile.wallTile;
        } else {
            map[x][y] = Game.Tile.floorTile;
        }       
    }

    generator.create(setMapTile);

    var makeDoor = function(x, y) {
        map[x][y] = Game.Tile.doorTile;
    }
    
    var rooms = generator.getRooms();
    for (var i=0; i<rooms.length; i++) {
        var room = rooms[i];
        //console.log(room.clearDoors());
        room.getDoors(makeDoor);
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
    var tilesFilled = 1;
    var tiles = [{x:x, y:y}];
    var tile;
    var neighbors;
    // Update the region of the original tile
    this._regions[x][y] = region;
    // Keep looping while we still have tiles to process
    while (tiles.length > 0) {
        tile = tiles.pop();
        // Get the neighbors of the tile
        neighbors = Game.getNeighborPositions(tile.x, tile.y);
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
    for (var x = 0; x < this._width; x++) {
        for (var y = 0; y < this._height; y++) {
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
    var region = 1;
    var tilesFilled;
    // Iterate through all tiles searching for a tile that can be used as the starting point for a flood fill
    for (var x = 0; x < this._width; x++) {
        for (var y = 0; y < this._height; y++) {
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
Game.Builder.prototype._setStairs = function() {
    var matches = [];
    // Iterate through all tiles, checking if they are floor tiles. 
    for (var x = 0; x < this._width; x++) {
        for (var y = 0; y < this._height; y++) {
            if (this._tiles[x][y]  == Game.Tile.floorTile) {
                matches.push({x: x, y: y});
            }
        }
    }
    // We shuffle the list of matches to prevent bias
    var match =  matches[Math.floor(Math.random() * matches.length)];
    this._tiles[match.x][match.y] = Game.Tile.stairsDownTile;
}

// Generates barrel at a free location
Game.Builder.prototype._setBarrel = function() {
    var matches = [];
    // Iterate through all tiles, checking if they are floor tiles. 
    for (var x = 0; x < this._width; x++) {
        for (var y = 0; y < this._height; y++) {
            if (this._tiles[x][y]  == Game.Tile.floorTile) {
                matches.push({x: x, y: y});
            }
        }
    }
    // We shuffle the list of matches to prevent bias
    var match =  matches[Math.floor(Math.random() * matches.length)];
    this._tiles[match.x][match.y] = Game.Tile.barrelTile;
}

// Generates grass at free locations
Game.Builder.prototype._setGrass = function() {
    var matches = [];
    // Iterate through all tiles, checking if they are floor tiles. 
    for (var x = 0; x < this._width; x++) {
        for (var y = 0; y < this._height; y++) {
            if (this._tiles[x][y]  == Game.Tile.floorTile) {
                matches.push({x: x, y: y});
            }
        }
    }
    // We shuffle the list of matches to prevent bias
    var match =  matches[Math.floor(Math.random() * matches.length)];
    var grassList = [];
    grassList.push(match);
    this._cellGrow(grassList, Game.Tile.grassTile)
}

// Generates grass at free locations
Game.Builder.prototype._setShallowWater = function() {
    var matches = [];
    // Iterate through all tiles, checking if they are floor tiles. 
    for (var x = 0; x < this._width; x++) {
        for (var y = 0; y < this._height; y++) {
            if (this._tiles[x][y]  == Game.Tile.floorTile) {
                matches.push({x: x, y: y});
            }
        }
    }
    // We shuffle the list of matches to prevent bias
    var match =  matches[Math.floor(Math.random() * matches.length)];
    var waterList = [];
    waterList.push(match);
    this._cellGrow(waterList, Game.Tile.shallowWaterTile)
}

// Generates grass at free locations
Game.Builder.prototype._cellGrow = function(list, tileType) {
    var growthCount = 0;
    var i = 0;
    while (growthCount < 20){
        var currentTile = list[i]
        if (currentTile === undefined){
            break;
        }
        var x = currentTile.x;
        var y = currentTile.y;

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
