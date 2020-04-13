Game.ItemRepository = new Game.Repository('items', Game.Item);

Game.ItemRepository.define('apple', {
    name: 'apple',
    character: '*',
    foreground: 'red',
    foodValue: 40,
    mixins: [Game.ItemMixins.Edible]
});

Game.ItemRepository.define('rock', {
    name: 'rock',
    character: '%',
    foreground: 'white'
});

Game.ItemRepository.define('head', {
    name: 'head',
    character: '%',
}, {
    disableRandomCreation: true
});