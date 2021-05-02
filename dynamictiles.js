// Create our central entity repository
Game.DynamicTileRepository = new Game.Repository('dynamicTiles', Game.DynamicTile);

Game.DynamicTileRepository.define('fireTile', {
    character: '^',
    name: 'fireTile',
    foreground: Game.Colors.flameColor,
    background: Game.Colors.glowColor,
    walkable: true,
    blocksLight: false,
    lifespan: 8,
    isHazard: true,
    description: "a dancing flame",
    mixins: [Game.DynamicTileMixins.Actor, Game.DynamicTileMixins.Spreadable]
});

Game.DynamicTileRepository.define('wineTile', {
    character: '.',
    name: 'wineTile',
    foreground: "#D6E4F2",
    background: Game.Colors.wineColor,
    walkable: true,
    blocksLight: false,
    description: 'a pool of wine',
});

