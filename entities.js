// Player template
Game.PlayerTemplate = {
    character: '@',
    foreground: 'white',
    maxHp: 40,
    attackValue: 10,
    sightRadius: 100,
    inventorySlots: 10,
    mixins: [Game.EntityMixins.PlayerActor, Game.EntityMixins.Thrower,
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
    foreground: 'pink',
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
    foreground: 'green',
    maxHp: 3,
    attackValue: 2,
    mixins: [Game.EntityMixins.TaskActor, Game.EntityMixins.Attacker, Game.EntityMixins.Destructible]
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

Game.EntityRepository.define('giant zombie', {
    name: 'zombie', 
    character: 'Z',
    foreground: 'teal',
    maxHp: 10,
    attackValue: 5,
    defenseValue: 5,
    sightRadius: 8,
    headHits: 2,
    tasks: ['hunt', 'wander'],
    mixins: [Game.EntityMixins.TaskActor, Game.EntityMixins.Sight,
             Game.EntityMixins.Attacker, Game.EntityMixins.Destructible,
             Game.EntityMixins.HeadDropper]
});

Game.EntityRepository.define('slime', {
    name: 'slime',
    character: 's',
    foreground: 'lightGreen',
    maxHp: 10,
    attackValue: 5,
    sightRadius: 6,
    tasks: ['hunt', 'wander'],
    mixins: [Game.EntityMixins.TaskActor, Game.EntityMixins.Sight,
             Game.EntityMixins.Attacker, Game.EntityMixins.Destructible]
});