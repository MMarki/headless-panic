// Player template
Game.PlayerTemplate = {
    character: '@',
    foreground: 'white',
    maxHp: 40,
    attackValue: 10,
    sightRadius: 100,
    inventorySlots: 10,
    mixins: [Game.EntityMixins.PlayerActor,
             Game.EntityMixins.Attacker, Game.EntityMixins.Destructible,
             Game.EntityMixins.InventoryHolder, Game.EntityMixins.Bleeder,
             Game.EntityMixins.Sight, Game.EntityMixins.MessageRecipient,
             Game.EntityMixins.Equipper]
};

// Create our central entity repository
Game.EntityRepository = new Game.Repository('entities', Game.Entity);

Game.EntityRepository.define('fungus', {
    name: 'fungus',
    character: 'F',
    foreground: 'green',
    maxHp: 10,
    speed: 500,
    mixins: [Game.EntityMixins.FungusActor, Game.EntityMixins.Destructible]
});

Game.EntityRepository.define('bat', {
    name: 'bat',
    character: 'B',
    foreground: 'white',
    maxHp: 5,
    attackValue: 4,
    speed: 2000,
    mixins: [Game.EntityMixins.TaskActor, Game.EntityMixins.HeadDropper,
             Game.EntityMixins.Attacker, Game.EntityMixins.Destructible]
});

Game.EntityRepository.define('newt', {
    name: 'newt',
    character: 'n',
    foreground: 'yellow',
    maxHp: 3,
    attackValue: 2,
    mixins: [Game.EntityMixins.TaskActor, Game.EntityMixins.HeadDropper,
             Game.EntityMixins.Attacker, Game.EntityMixins.Destructible]
});

Game.EntityRepository.define('kobold', {
    name: 'kobold',
    character: 'k',
    foreground: 'white',
    maxHp: 6,
    attackValue: 4,
    sightRadius: 6,
    tasks: ['hunt', 'wander'],
    mixins: [Game.EntityMixins.TaskActor, Game.EntityMixins.Sight,
             Game.EntityMixins.Attacker, Game.EntityMixins.Destructible,
             Game.EntityMixins.HeadDropper]
});