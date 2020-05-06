// Player template
Game.PlayerTemplate = {
    character: '@',
    name: 'chicken knight',
    foreground: 'white',
    maxHP: 40,
    attackValue: 3,
    accuracyValue: 100,
    sightRadius: 100,
    inventorySlots: 20,
    mixins: [Game.EntityMixins.PlayerActor, Game.EntityMixins.Thrower,
             Game.EntityMixins.Attacker, Game.EntityMixins.Destructible,
             Game.EntityMixins.InventoryHolder, Game.EntityMixins.Bleeder,
             Game.EntityMixins.Sight, Game.EntityMixins.MessageRecipient,
             Game.EntityMixins.Equipper, Game.EntityMixins.Affectible,
             Game.EntityMixins.Summoner]
};

// Create our central entity repository
Game.EntityRepository = new Game.Repository('entities', Game.Entity);

Game.EntityRepository.define('fungus', {
    name: 'fungus',
    character: '\u2660',
    foreground: '#b33951',
    maxHP: 10,
    speed: 500,
    description: "Fungus multiplies at an astonishing rate.",
    mixins: [Game.EntityMixins.FungusActor, Game.EntityMixins.Destructible, 
             Game.EntityMixins.Affectible]
});

Game.EntityRepository.define('barrel', {
    name: 'barrel',
    character: '#',
    foreground: "#C4B9AC",
    background: "#B57F50",
    explodeTile: 'wineTile',
    explodeSize: 6,
    maxHP: 1,
    notMonster: true,
    description: "A wooden container for wine.",
    mixins: [Game.EntityMixins.Destructible, Game.EntityMixins.Exploder]
});

Game.EntityRepository.define('bat', {
    name: 'bat',
    character: 'b',
    foreground: '#f1f7ed',
    maxHP: 5,
    attackValue: 4,
    accuracyValue: 50,
    speed: 1000,
    description: "This monster flies quickly, and won't attack unless you bother it.",
    mixins: [Game.EntityMixins.TaskActor, Game.EntityMixins.HeadDropper,
             Game.EntityMixins.Attacker, Game.EntityMixins.Destructible,
             Game.EntityMixins.Affectible]
});

Game.EntityRepository.define('jackal', {
    name: 'jackal',
    character: 'j',
    foreground: '#c06e52',
    maxHP: 5,
    attackValue: 4,
    accuracyValue: 70,
    speed: 2000,
    tasks: ['hunt', 'wander'],
    description: "An aggressive dog who can move or attack twice each turn.",
    mixins: [Game.EntityMixins.TaskActor, Game.EntityMixins.Sight,
             Game.EntityMixins.HeadDropper, Game.EntityMixins.Attacker, 
             Game.EntityMixins.Destructible, Game.EntityMixins.Affectible]
});

Game.EntityRepository.define('kobold', {
    name: 'kobold',
    character: 'k',
    foreground: '#c06e52',
    maxHP: 6,
    attackValue: 3,
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
    attackValue: 5,
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
    maxHP: 20,
    attackValue: 3,
    accuracyValue: 70,
    sightRadius: 6,
    splitOnHit: 1,
    summonCount: 1,
    description: "A sentient blob of jelly that divides when hit.",
    tasks: ['hunt', 'wander'],
    mixins: [Game.EntityMixins.TaskActor, Game.EntityMixins.Sight,
             Game.EntityMixins.Attacker, Game.EntityMixins.Destructible, 
             Game.EntityMixins.Affectible, Game.EntityMixins.Summoner]
});

Game.EntityRepository.define('floater', {
    name: 'floater',
    character: 'f',
    foreground: '#91f291',
    maxHP: 3,
    attackValue: 0,
    accuracyValue: 70,
    sightRadius: 10,
    explodeTile: 'poisonTile',
    explodeSize: 10,
    description: "Blows up on contact, creates a pool of poison slime.",
    tasks: ['hunt', 'wander'],
    mixins: [Game.EntityMixins.TaskActor, Game.EntityMixins.Sight,
             Game.EntityMixins.Destructible, Game.EntityMixins.Affectible,
             Game.EntityMixins.Exploder]
});

Game.EntityRepository.define('rat', {
    name: 'rat',
    character: 'r',
    foreground: '#e3d081',
    maxHP: 3,
    defenseValue: 0,
    attackValue: 1,
    accuracyValue: 30,
    sightRadius: 10,
    description: "A mean little denizen of cellars and sewers.",
    tasks: ['hunt', 'wander'],
    mixins: [Game.EntityMixins.TaskActor, Game.EntityMixins.Sight,
             Game.EntityMixins.Attacker, Game.EntityMixins.Destructible,
            Game.EntityMixins.Affectible]
});

// Should be able to spawn rats, hurl dead rats
Game.EntityRepository.define('rat king', {
    name: 'rat king',
    character: 'R',
    foreground: '#e3d081',
    maxHP: 30,
    defenseValue: 15,
    attackValue: 6,
    accuracyValue: 70,
    sightRadius: 15,
    headHits: 3,
    summonWaitMax: 25,
    description: "A giant rat nestled in a ball of its dead rivals",
    tasks: ['summonMonster', 'hunt', 'wander'],
    mixins: [Game.EntityMixins.TaskActor, Game.EntityMixins.Sight,
             Game.EntityMixins.Attacker, Game.EntityMixins.Destructible,
             Game.EntityMixins.HeadDropper, Game.EntityMixins.Affectible,
             Game.EntityMixins.Summoner]
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


Game.EntityRepository.repoFrequency = {
    'L1': [{'rat': 3}, {'kobold': 2}, {'bat':2}, {'jackal': 1}, {'floater': 2}],
    'L2': [{'rat': 2}, {'kobold': 2}, {'bat':2}, {'jackal': 1}, {'goblin': 1}, {'floater': 1}],
    'L3': [{'rat': 2}, {'kobold': 2}, {'bat':2}, {'jackal': 1}, {'goblin': 1}, {'floater': 1}, {'slime': 1}, {'rat king': 1}],
    'L4': [{'rat': 2}, {'goblin': 1}, {'floater': 1}, {'slime': 2}],
    'L5': [{'rat': 2}, {'goblin': 1}, {'floater': 1}, {'slime': 2}],
    'L6': [{'rat': 2}, {'goblin': 1}, {'floater': 1}, {'slime': 2}]
}
