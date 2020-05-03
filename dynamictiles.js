// Create our central entity repository
Game.DynamicTileRepository = new Game.Repository('dynamicTiles', Game.DynamicTile);

Game.DynamicTileRepository.define('fireTile', {
    character: '^',
    foreground: "#F44708",
    walkable: true,
    blocksLight: false,
    isDynamic: true,
    lifespan: 8,
    description: "a dancing flame",
    mixins: [Game.DynamicTileMixins.Actor]
});

Game.DynamicTileRepository.define('poisonTile', {
    character: '.',
    foreground: '#FFF',
    background: '#1C9B03',
    walkable: true,
    blocksLight: false,
    isDynamic: true,
    lifespan: 6,
    description: 'a pool of bubbling poison',
    mixins: [Game.DynamicTileMixins.Actor]
});

Game.DynamicTileRepository.define('wineTile', {
    ccharacter: '.',
    foreground: "#fff",
    background: "#B07BAC",
    walkable: true,
    blocksLight: false,
    isDynamic: true,
    description: 'a pool of wine'
});