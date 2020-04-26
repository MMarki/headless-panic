// Player template
Game.PlayerTemplate = {
    character: '@',
    name: 'chicken knight',
    foreground: 'white',
    maxHP: 40,
    attackValue: 10,
    accuracyValue: 100,
    sightRadius: 100,
    inventorySlots: 15,
    mixins: [Game.EntityMixins.PlayerActor, Game.EntityMixins.Thrower,
             Game.EntityMixins.Attacker, Game.EntityMixins.Destructible,
             Game.EntityMixins.InventoryHolder, Game.EntityMixins.Bleeder,
             Game.EntityMixins.Sight, Game.EntityMixins.MessageRecipient,
             Game.EntityMixins.Equipper, Game.EntityMixins.Affectible]
};

// Create our central entity repository
Game.EntityRepository = new Game.Repository('entities', Game.Entity);

Game.EntityRepository.define('fungus', {
    name: 'fungus',
    character: 'F',
    foreground: '#b33951',
    maxHP: 10,
    speed: 500,
    description: "Fungus multiplies at an astonishing rate.",
    mixins: [Game.EntityMixins.FungusActor, Game.EntityMixins.Destructible, 
             Game.EntityMixins.Affectible]
});

Game.EntityRepository.define('bat', {
    name: 'bat',
    character: 'B',
    foreground: '#f1f7ed',
    maxHP: 5,
    attackValue: 4,
    accuracyValue: 70,
    speed: 2000,
    description: "This monster flies quickly, and won't attack unless you bother it.",
    mixins: [Game.EntityMixins.TaskActor, Game.EntityMixins.HeadDropper,
             Game.EntityMixins.Attacker, Game.EntityMixins.Destructible,
             Game.EntityMixins.Affectible]
});

Game.EntityRepository.define('newt', {
    name: 'newt',
    character: 'n',
    foreground: '#91c7b1',
    maxHP: 3,
    accuracyValue: 70,
    attackValue: 2,
    description: "Newt are weak, slimy, and docile.",
    mixins: [Game.EntityMixins.TaskActor, Game.EntityMixins.Attacker, 
             Game.EntityMixins.Destructible, Game.EntityMixins.Affectible]
});

Game.EntityRepository.define('kobold', {
    name: 'kobold',
    character: 'k',
    foreground: '#c06e52',
    maxHP: 6,
    attackValue: 4,
    defenseValue: 0,
    accuracyValue: 70,
    sightRadius: 10,
    description: "A small, scaly, aggressive humanoid.",
    tasks: ['hunt', 'wander'],
    mixins: [Game.EntityMixins.TaskActor, Game.EntityMixins.Sight,
             Game.EntityMixins.Attacker, Game.EntityMixins.Destructible,
             Game.EntityMixins.HeadDropper, Game.EntityMixins.Affectible]
});

Game.EntityRepository.define('goblin', {
    name: 'goblin',
    character: 'g',
    foreground: '#91C7B1',
    maxHP: 8,
    attackValue: 4,
    defenseValue: 10,
    accuracyValue: 70,
    sightRadius: 10,
    description: "An armored underdweller with bulging eyes and green skin.",
    tasks: ['hunt', 'wander'],
    mixins: [Game.EntityMixins.TaskActor, Game.EntityMixins.Sight,
             Game.EntityMixins.Attacker, Game.EntityMixins.Destructible,
             Game.EntityMixins.HeadDropper, Game.EntityMixins.Affectible]
});

Game.EntityRepository.define('giant zombie', {
    name: 'zombie', 
    character: 'Z',
    foreground: 'teal',
    maxHP: 10,
    attackValue: 5,
    defenseValue: 10,
    accuracyValue: 70,
    sightRadius: 8,
    headHits: 2,
    description: "A shambling undead monster that smells of decay.",
    tasks: ['hunt', 'wander'],
    mixins: [Game.EntityMixins.TaskActor, Game.EntityMixins.Sight,
             Game.EntityMixins.Attacker, Game.EntityMixins.Destructible,
             Game.EntityMixins.HeadDropper, Game.EntityMixins.Affectible]
});

Game.EntityRepository.define('slime', {
    name: 'slime',
    character: 's',
    foreground: 'lightGreen',
    maxHP: 10,
    attackValue: 5,
    accuracyValue: 70,
    sightRadius: 6,
    description: "A sentient blob of jelly that divides when hit.",
    tasks: ['hunt', 'wander'],
    mixins: [Game.EntityMixins.TaskActor, Game.EntityMixins.Sight,
             Game.EntityMixins.Attacker, Game.EntityMixins.Destructible, 
             Game.EntityMixins.Affectible]
});

Game.EntityRepository.define('rat', {
    name: 'rat',
    character: 'r',
    foreground: '#e3d081',
    maxHP: 3,
    defenseValue: 0,
    attackValue: 1,
    accuracyValue: 70,
    sightRadius: 10,
    description: "A meaner little denizen of cellars and sewers.",
    tasks: ['hunt', 'wander'],
    mixins: [Game.EntityMixins.TaskActor, Game.EntityMixins.Sight,
             Game.EntityMixins.Attacker, Game.EntityMixins.Destructible,
             Game.EntityMixins.Affectible]
});

Game.EntityRepository.define('death', {
    name: 'death',
    character: '\u2625',
    foreground: '#b7fdfe',
    maxHP: 3,
    defenseValue: 0,
    attackValue: 1,
    accuracyValue: 70,
    sightRadius: 10,
    description: "She seeks what is hers.",
    tasks: ['hunt', 'wander'],
    mixins: [Game.EntityMixins.TaskActor, Game.EntityMixins.Sight,
             Game.EntityMixins.Attacker, Game.EntityMixins.Destructible,
             Game.EntityMixins.Affectible]
});
