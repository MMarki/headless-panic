// Create our central entity repository
Game.GasRepository = new Game.Repository('dynamicTiles', Game.DynamicTile);

Game.GasRepository.define('poisonTile', {
    character: '.',
    name: 'poisonTile',
    foreground: '#FFF',
    background: '#1C9B03',
    blocksLight: false,
    lifespan: 6,
    isHazard: true,
    description: 'a cloud of poison'
});

Game.GasRepository.define('darknessTile', {
    character: '.',
    name: 'darknessTile',
    foreground: Game.Colors.darknessColor,
    background: Game.Colors.darknessColor,
    blocksLight: true,
    lifespan: 6,
    isHazard: true,
    description: 'a cloud of magic darkness'
});

