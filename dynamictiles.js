// Create our central entity repository
Game.DynamicTileRepository = new Game.Repository('dynamicTiles', Game.DynamicTile);

Game.DynamicTileRepository.define('fireTile', {
    character: '^',
    name: 'fireTile',
    foreground: "#F44708",
    background: "291201",
    walkable: true,
    blocksLight: false,
    isDynamic: true,
    lifespan: 8,
    isHazard: true,
    description: "a dancing flame",
    mixins: [Game.DynamicTileMixins.Actor, Game.DynamicTileMixins.Spreadable]
});

Game.DynamicTileRepository.define('poisonTile', {
    character: '.',
    name: 'poisonTile',
    foreground: '#FFF',
    background: '#1C9B03',
    walkable: true,
    blocksLight: false,
    isDynamic: true,
    lifespan: 6,
    isHazard: true,
    description: 'a pool of bubbling poison',
    mixins: [Game.DynamicTileMixins.Actor]
});

Game.DynamicTileRepository.define('wineTile', {
    character: '.',
    name: 'wineTile',
    foreground: "#D6E4F2",
    background: "#B07BAC",
    walkable: true,
    blocksLight: false,
    isDynamic: true,
    description: 'a pool of wine',
});

Game.DynamicTileRepository.define('darknessTile', {
    character: '.',
    name: 'darknessTile',
    foreground: "#1D1D1D",
    background: "#1D1D1D",
    walkable: true,
    blocksLight: true,
    isDynamic: true,
    lifespan: 6,
    isHazard: true,
    description: 'a cloud of magic darkness',
    mixins: [Game.DynamicTileMixins.Actor]
});

