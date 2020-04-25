Game.Tile = function(properties) {
    properties = properties || {};
    // Call the Glyph constructor with our properties
    Game.Glyph.call(this, properties);
    // Set up the properties. We use false by default.
    this._walkable = properties['walkable'] || false;
    this._diggable = properties['diggable'] || false;
    this._blocksLight = (properties['blocksLight'] !== undefined) ?
        properties['blocksLight'] : true;
    this._description = properties['description'] || '';
};
// Make tiles inherit all the functionality from glyphs
Game.Tile.extend(Game.Glyph);

// Standard getters
Game.Tile.prototype.isWalkable = function() {
    return this._walkable;
}
Game.Tile.prototype.isDiggable = function() {
    return this._diggable;
}
Game.Tile.prototype.isBlockingLight = function() {
    return this._blocksLight;
}
Game.Tile.prototype.getDescription = function() {
    return this._description;
};

Game.Tile.nullTile = new Game.Tile({})

Game.Tile.floorTile = new Game.Tile({
    character: '.',
    background: "#080A1F",
    walkable: true,
    blocksLight: false,
    description: 'a cave floor'
});

Game.Tile.rubbleTile = new Game.Tile({
    character: ',',
    background: "#080A1F",
    walkable: true,
    blocksLight: false,
    description: 'a small pile of rubble'
});

Game.Tile.bloodTile = new Game.Tile({
    character: '.',
    foreground: "#F61067",
    background: "#080A1F",
    walkable: true,
    blocksLight: false,
    description: 'a pool of blood'
});

Game.Tile.wallTile = new Game.Tile({
    character: '#',
    foreground: '#232121',
    background: "#C4B9AC",
    diggable: true,
    description: 'a stone wall'
});

Game.Tile.stairsDownTile = new Game.Tile({
    character: '>',
    foreground: '#F2EC2D',
    walkable: true,
    blocksLight: false,
    description: 'a staircase leading downward'
});

Game.Tile.waterTile = new Game.Tile({
    character: '~',
    foreground: '#2191fb',
    walkable: false,
    blocksLight: false,
    description: 'deep water'
});

Game.getNeighborPositions = function(x, y) {
    var tiles = [];
    // Generate all possible offsets
    for (var dX = -1; dX < 2; dX ++) {
        for (var dY = -1; dY < 2; dY++) {
            // Make sure it isn't the same tile
            if (dX == 0 && dY == 0) {
                continue;
            }
            tiles.push({x: x + dX, y: y + dY});
        }
    }
    return Game.randomize(tiles);
}

Game.randomize = function(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
  
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
  
      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
  
    return array;
  }