Game.Tile.nullTile = new Game.Tile({})

Game.Tile.floorTile = new Game.Tile({
    character: '.',
    background: Game.Colors.floorColor,
    walkable: true,
    blocksLight: false,
    description: 'a cave floor'
});

Game.Tile.rubbleTile = new Game.Tile({
    character: ',',
    background: Game.Colors.floorColor,
    walkable: true,
    blocksLight: false,
    description: 'a small pile of rubble'
});

Game.Tile.bloodTile = new Game.Tile({
    character: '.',
    foreground: Game.Colors.red,
    background: Game.Colors.floorColor,
    walkable: true,
    blocksLight: false,
    description: 'a pool of blood'
});

Game.Tile.altarTile = new Game.Tile({
    character: '|',
    foreground: "#fff",
    background: Game.Colors.charcoalColor,
    walkable: true,
    blocksLight: false,
    description: 'an altar where you can charge a magic item'
});

Game.Tile.wallTile = new Game.Tile({
    character: '#',
    foreground: Game.Colors.charcoalColor,
    background: Game.Colors.wallColor,
    diggable: true,
    description: 'a stone wall',
    vary: true
});

Game.Tile.stairsDownTile = new Game.Tile({
    character: '>',
    foreground: Game.Colors.yellow,
    walkable: true,
    blocksLight: false,
    description: 'a staircase leading downward'
});

Game.Tile.stairsDownTileLocked = new Game.Tile({
    character: '>',
    foreground: Game.Colors.yellow,
    background: Game.Colors.doorColor,
    walkable: true,
    blocksLight: false,
    description: 'a locked trapdoor leading downward'
});

Game.Tile.waterTile = new Game.Tile({
    character: '~',
    foreground: '#2191fb',
    walkable: false,
    blocksLight: false,
    description: 'deep water',
    isWater: true
});

Game.Tile.shallowWaterTile = new Game.Tile({
    character: '.',
    foreground: '#fff',
    background: '#2A94E0',
    walkable: true,
    blocksLight: false,
    description: 'a pool of shallow water',
    isWater: true
});

Game.Tile.doorTile = new Game.Tile({
    character: '+', //'
    foreground: '#FFF',
    background: Game.Colors.doorColor,
    walkable: true,
    unthrowable: false,
    blocksLight: true,
    diggable: true,
    description: 'a closed door'
});

Game.Tile.openDoorTile = new Game.Tile({
    character: '-', //'
    foreground: '#FFF',
    background: Game.Colors.doorColor,
    walkable: true,
    blocksLight: false,
    diggable: true,
    description: 'an open door'
});

Game.Tile.grassTile = new Game.Tile({
    character: '"',
    foreground: Game.Colors.green,
    background: Game.Colors.floorColor,
    walkable: true,
    blocksLight: false,
    flammable: true,
    description: 'a patch of grass'
});

Game.Tile.fernTile = new Game.Tile({
    character: '\u01AA',
    foreground: Game.Colors.green,
    background: Game.Colors.floorColor,
    walkable: true,
    blocksLight: true,
    flammable: true,
    description: 'a tall fern',
    vary: true
});

Game.Tile.ashTile = new Game.Tile({
    character: ',',
    foreground: "#777777",
    walkable: true,
    blocksLight: false,
    description: "ash"
});