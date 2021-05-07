// Player template
Game.PlayerTemplate = {
    character: '@',
    name: 'chicken knight',
    foreground: 'white',
    maxHP: 40,
    attackValue: 2,
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

Game.EntityRepository.define('barrel', {
    name: 'barrel',
    character: '#',
    foreground: "#C4B9AC",
    background: Game.Colors.barrelColor,
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
    foreground: Game.Colors.batColor,
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
    foreground: Game.Colors.jackalColor,
    maxHP: 5,
    attackValue: 4,
    accuracyValue: 70,
    speed: 2000,
    tasks: ['hunt', 'wander'],
    description: "An aggressive dog who can move or attack twice each turn.",
    headPower: '50% chance to attack twice',
    mixins: [Game.EntityMixins.TaskActor, Game.EntityMixins.Sight,
             Game.EntityMixins.HeadDropper, Game.EntityMixins.Attacker, 
             Game.EntityMixins.Destructible, Game.EntityMixins.Affectible]
});

Game.EntityRepository.define('piranha', {
    name: 'piranha',
    character: 'p',
    foreground: Game.Colors.piranhaColor,
    maxHP: 7,
    attackValue: 8,
    accuracyValue: 90,
    speed: 2000,
    tasks: ['hunt', 'wander'],
    description: "An aggressive fish who can move or attack twice each turn.",
    headPower: '50% chance to attack twice',
    mixins: [Game.EntityMixins.TaskActor, Game.EntityMixins.Sight,
             Game.EntityMixins.HeadDropper, Game.EntityMixins.Attacker, 
             Game.EntityMixins.Destructible, Game.EntityMixins.Affectible,
             Game.EntityMixins.Swimmer]
});

Game.EntityRepository.define('hydra', {
    name: 'hydra',
    character: 'H',
    foreground: Game.Colors.hydraColor,
    maxHP: 100,
    attackValue: 10,
    defenseValue: 20,
    accuracyValue: 80,
    speed: 1000,
    heads: 5,
    tasks: ['hunt', 'wander'],
    description: "A massive, many-headed serpent.",
    headPower: 'STRN + 1',
    mixins: [Game.EntityMixins.TaskActor, Game.EntityMixins.Sight,
             Game.EntityMixins.HeadDropper, Game.EntityMixins.Attacker, 
             Game.EntityMixins.Destructible, Game.EntityMixins.Affectible,
             Game.EntityMixins.Swimmer, Game.EntityMixins.KeyDropper,
             Game.EntityMixins.MultiHeaded]
});

Game.EntityRepository.define('kobold', {
    name: 'kobold',
    character: 'k',
    foreground: Game.Colors.koboldColor,
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
    foreground: Game.Colors.goblinColor,
    maxHP: 9,
    attackValue: 5,
    defenseValue: 10,
    accuracyValue: 70,
    sightRadius: 10,
    headHits: 2,
    description: "An armored underdweller with bulging eyes and green skin.",
    headPower: 'ARMR +1',
    tasks: ['hunt', 'wander'],
    mixins: [Game.EntityMixins.TaskActor, Game.EntityMixins.Sight,
             Game.EntityMixins.Attacker, Game.EntityMixins.Destructible,
             Game.EntityMixins.HeadDropper, Game.EntityMixins.Affectible]
});

Game.EntityRepository.define('bee', {
    name: 'giant bee',
    character: 'B',
    foreground: Game.Colors.beeColor,
    maxHP: 12,
    attackValue: 4,
    defenseValue: 10,
    accuracyValue: 70,
    sightRadius: 12,
    headHits: 1,
    description: "A giant bee with a barbed stinger.",
    headPower: '20% chance to paralyze on hit',
    tasks: ['hunt', 'wander'],
    mixins: [Game.EntityMixins.TaskActor, Game.EntityMixins.Sight,
             Game.EntityMixins.Attacker, Game.EntityMixins.Destructible,
             Game.EntityMixins.HeadDropper, Game.EntityMixins.Affectible,
             Game.EntityMixins.Paralyzer]
});

Game.EntityRepository.define('toadman', {
    name: 'toadman',
    character: 't',
    foreground: Game.Colors.toadColor,
    maxHP: 10,
    attackValue: 7,
    defenseValue: 10,
    accuracyValue: 80,
    sightRadius: 12,
    headHits: 1,
    description: "A bloated half-toad-half-man.",
    headPower: 'ARMR +1 on water tiles',
    tasks: ['hunt', 'wander'],
    mixins: [Game.EntityMixins.TaskActor, Game.EntityMixins.Sight,
             Game.EntityMixins.Attacker, Game.EntityMixins.Destructible,
             Game.EntityMixins.HeadDropper, Game.EntityMixins.Affectible,
             Game.EntityMixins.Hopper]
});

Game.EntityRepository.define('kappa', {
    name: 'kappa',
    character: 'K',
    foreground: Game.Colors.goblinColor,
    maxHP: 18,
    attackValue: 8,
    defenseValue: 13,
    accuracyValue: 80,
    sightRadius: 14,
    headHits: 1,
    description: "A turtle-like creature. It's stronger than it looks.",
    headPower: 'ARMR +1',
    tasks: ['hunt', 'wander'],
    mixins: [Game.EntityMixins.TaskActor, Game.EntityMixins.Sight,
             Game.EntityMixins.Attacker, Game.EntityMixins.Destructible,
             Game.EntityMixins.HeadDropper, Game.EntityMixins.Affectible,
             Game.EntityMixins.Deflecter]
});

Game.EntityRepository.define('mushroom man', {
    name: 'mushroom man',
    character: 'M',
    foreground: Game.Colors.mushroomColor,
    maxHP: 15,
    attackValue: 10,
    defenseValue: 4,
    accuracyValue: 80,
    sightRadius: 14,
    vulnerabilities: ['fire'],
    description: "A humanoid hulk of living fungus with no discernible head.",
    tasks: ['hunt', 'wander'],
    mixins: [Game.EntityMixins.TaskActor, Game.EntityMixins.Sight,
             Game.EntityMixins.Attacker, Game.EntityMixins.Destructible,
             Game.EntityMixins.Affectible, Game.EntityMixins.Unpoisonable]
});

Game.EntityRepository.define('toad queen', {
    name: 'toad queen',
    character: 'T',
    foreground: Game.Colors.toadColor,
    maxHP: 55,
    attackValue: 7,
    defenseValue: 10,
    accuracyValue: 70,
    sightRadius: 12,
    headHits: 2,
    explodeTile: 'poisonTile',
    explodeSize: 12,
    description: "An ox-sized toad.",
    summonWaitMax: 30,
    summonCount: 1,
    summonName: 'toadman',
    tasks: ['summonMonster', 'hunt', 'wander'],
    headPower: 'ARMR +1 on water tiles',
    mixins: [Game.EntityMixins.TaskActor, Game.EntityMixins.Sight,
             Game.EntityMixins.Attacker, Game.EntityMixins.Destructible,
             Game.EntityMixins.HeadDropper, Game.EntityMixins.Affectible,
             Game.EntityMixins.Hopper, Game.EntityMixins.Summoner,
             Game.EntityMixins.Exploder, Game.EntityMixins.KeyDropper]
});

Game.EntityRepository.define('poison toad', {
    name: 'poison toad',
    character: 'P',
    foreground: Game.Colors.poisonToadColor,
    maxHP: 15,
    attackValue: 5,
    defenseValue: 8,
    accuracyValue: 70,
    sightRadius: 12,
    headHits: 1,
    description: "A large scaly purple toad with venom dripping from its maw.",
    tasks: ['hunt', 'wander'],
    headPower: '40% chance to poison on hit',
    mixins: [Game.EntityMixins.TaskActor, Game.EntityMixins.Sight,
             Game.EntityMixins.Attacker, Game.EntityMixins.Destructible,
             Game.EntityMixins.HeadDropper, Game.EntityMixins.Affectible,
             Game.EntityMixins.Poisoner, Game.EntityMixins.Unpoisonable]
});

Game.EntityRepository.define('acid jelly', {
    name: 'acid jelly',
    character: 'a',
    foreground: Game.Colors.floaterColor,
    maxHP: 8,
    attackValue: 4,
    defenseValue: 10,
    accuracyValue: 80,
    sightRadius: 12,
    resistances: ['slash'],
    description: "A caustic, lurching pile. Melts armor.",
    tasks: ['hunt', 'wander'],
    mixins: [Game.EntityMixins.TaskActor, Game.EntityMixins.Sight,
             Game.EntityMixins.Attacker, Game.EntityMixins.Destructible,
             Game.EntityMixins.Affectible, Game.EntityMixins.Acidic]
});

Game.EntityRepository.define('zombie', {
    name: 'zombie', 
    character: 'z',
    foreground: 'teal',
    maxHP: 30,
    attackValue: 8,
    defenseValue: 10,
    accuracyValue: 70,
    sightRadius: 8,
    headHits: 1,
    description: "A shambling undead monster that smells of decay.",
    tasks: ['hunt', 'wander'],
    mixins: [Game.EntityMixins.TaskActor, Game.EntityMixins.Sight,
             Game.EntityMixins.Attacker, Game.EntityMixins.Destructible,
             Game.EntityMixins.HeadDropper, Game.EntityMixins.Affectible]
});

Game.EntityRepository.define('skeleton', {
    name: 'skeleton', 
    character: 's',
    foreground: 'white',
    maxHP: 10,
    attackValue: 6,
    defenseValue: 0,
    accuracyValue: 80,
    sightRadius: 8,
    headHits: 1,
    resistances: ['stab'],
    vulnerabilities: ['crush'],
    description: "An reanimated skeleton warrior.",
    tasks: ['hunt', 'wander'],
    mixins: [Game.EntityMixins.TaskActor, Game.EntityMixins.Sight,
             Game.EntityMixins.Attacker, Game.EntityMixins.Destructible,
             Game.EntityMixins.Affectible, Game.EntityMixins.Unpoisonable]
});

Game.EntityRepository.define('golem', {
    name: 'golem', 
    character: 'G',
    foreground: 'teal',
    maxHP: 50,
    attackValue: 22,
    defenseValue: 14,
    accuracyValue: 90,
    sightRadius: 10,
    headHits: 1,
    resistances: ['stab'],
    vulnerabilities: ['crush'],
    speed: 500,
    description: "A big rock monster.",
    tasks: ['hunt', 'wander'],
    headPower: '50% chance to knock back on hit',
    mixins: [Game.EntityMixins.TaskActor, Game.EntityMixins.Sight,
             Game.EntityMixins.Attacker, Game.EntityMixins.Destructible,
             Game.EntityMixins.HeadDropper, Game.EntityMixins.Affectible, 
             Game.EntityMixins.Unpoisonable, Game.EntityMixins.Pusher]
});

Game.EntityRepository.define('vampire', {
    name: 'vampire', 
    character: 'V',
    foreground: 'white',
    maxHP: 40,
    attackValue: 20,
    defenseValue: 12,
    accuracyValue: 90,
    sightRadius: 12,
    headHits: 2,
    vulnerabilities: ['stab'],
    speed: 2000,
    description: "A pale fanged humanoid in a tattered cloak.",
    tasks: ['hunt', 'wander'],
    headPower: 'Regains health on hit',
    mixins: [Game.EntityMixins.TaskActor, Game.EntityMixins.Sight,
             Game.EntityMixins.Attacker, Game.EntityMixins.Destructible,
             Game.EntityMixins.HeadDropper, Game.EntityMixins.Affectible,
             Game.EntityMixins.Sucker]
});

Game.EntityRepository.define('lich', {
    name: 'lich',
    character: 'L',
    foreground: Game.Colors.lichColor,
    maxHP: 110,
    attackValue: 15,
    defenseValue: 18,
    accuracyValue: 92,
    sightRadius: 13,
    headHits: 2,
    description: "A robed skeletal figure with a staff.",
    summonWaitMax: 30,
    summonCount: 3,
    castWaitMax: 5,
    summonName: 'skeleton',
    tasks: ['summonMonster', 'castRune', 'hunt', 'wander'],
    mixins: [Game.EntityMixins.TaskActor, Game.EntityMixins.Sight,
             Game.EntityMixins.Attacker, Game.EntityMixins.Destructible,
             Game.EntityMixins.Affectible, Game.EntityMixins.Summoner,
             Game.EntityMixins.KeyDropper, Game.EntityMixins.Unpoisonable]
});

Game.EntityRepository.define('slime', {
    name: 'slime',
    character: 'S',
    foreground: 'lightGreen',
    maxHP: 25,
    attackValue: 3,
    accuracyValue: 70,
    sightRadius: 6,
    splitOnHit: 1,
    summonCount: 1,
    summonWaitMax: 1,
    resistances: ['slash'],
    description: "A sentient blob of jelly that divides when hit.",
    tasks: ['hunt', 'wander'],
    mixins: [Game.EntityMixins.TaskActor, Game.EntityMixins.Sight,
             Game.EntityMixins.Attacker, Game.EntityMixins.Destructible, 
             Game.EntityMixins.Affectible, Game.EntityMixins.Summoner]
});

Game.EntityRepository.define('floater', {
    name: 'floater',
    character: 'F',
    foreground: Game.Colors.floaterColor,
    maxHP: 3,
    attackValue: 0,
    accuracyValue: 70,
    sightRadius: 12,
    explodeTile: 'poisonTile',
    explodeSize: 10,
    vulnerabilities: ['stab'],
    description: "Blows up on contact, creates a pool of poison slime.",
    tasks: ['hunt', 'wander'],
    mixins: [Game.EntityMixins.TaskActor, Game.EntityMixins.Sight,
             Game.EntityMixins.Destructible, Game.EntityMixins.Affectible,
             Game.EntityMixins.Exploder]
});

Game.EntityRepository.define('rat', {
    name: 'rat',
    character: 'r',
    foreground: Game.Colors.ratColor,
    maxHP: 3,
    defenseValue: 0,
    attackValue: 1,
    accuracyValue: 30,
    sightRadius: 10,
    description: "Its head is too small to fit your body.",
    tasks: ['hunt', 'wander'],
    mixins: [Game.EntityMixins.TaskActor, Game.EntityMixins.Sight,
             Game.EntityMixins.Attacker, Game.EntityMixins.Destructible,
            Game.EntityMixins.Affectible]
});

// Should be able to spawn rats, hurl dead rats
Game.EntityRepository.define('rat king', {
    name: 'rat king',
    character: 'R',
    foreground: Game.Colors.ratColor,
    maxHP: 33,
    defenseValue: 15,
    attackValue: 6,
    accuracyValue: 70,
    sightRadius: 15,
    headHits: 3,
    summonWaitMax: 25,
    description: "A huge rat nestled in a ball of its dead rivals",
    tasks: ['summonMonster', 'hunt', 'wander'],
    headPower: 'Rats will not be as aggressive toward you',
    mixins: [Game.EntityMixins.TaskActor, Game.EntityMixins.Sight,
             Game.EntityMixins.Attacker, Game.EntityMixins.Destructible,
             Game.EntityMixins.HeadDropper, Game.EntityMixins.Affectible,
             Game.EntityMixins.Summoner, Game.EntityMixins.KeyDropper]
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
    'L1': [{'rat': 2}, {'kobold': 2}, {'bat':2}, {'jackal': 1}],
    'L2': [{'rat': 3}, {'kobold': 2}, {'bat':2}, {'jackal': 1}, {'goblin': 1}],
    'L3': [{'rat': 2}, {'kobold': 2}, {'bat':2}, {'jackal': 1}, {'goblin': 1}, {'floater': 1}, {'slime': 1}],
    'L4': [{'rat': 2}, {'goblin': 1}, {'floater': 1}, {'slime': 2}, {'toadman': 2}, {'acid jelly': 1}],
    'L5': [{'rat': 1}, {'goblin': 1}, {'slime': 2}, {'toadman': 2}, {'acid jelly': 1}, {'poison toad': 1}],
    'L6': [{'rat': 1}, {'goblin': 1}, {'slime': 2}, {'toadman': 2}, {'acid jelly': 1}, {'poison toad': 2}],
    'L7': [{'kappa': 1}, {'slime': 2}, {'mushroom man': 1}, {'poison toad': 1}],
    'L8': [{'kappa': 1}, {'mushroom man': 1}, {'poison toad': 1}],
    'L9': [{'kappa': 1}, {'mushroom man': 1}, {'poison toad': 1}, {'piranha': 1}, {'bee':1}],
    'L10': [{'kappa': 1}, {'mushroom man': 1}, {'poison toad': 1}, {'piranha': 1}, {'bee':1}],
    'L11': [{'kappa': 1}, {'mushroom man': 1}, {'poison toad': 1}, {'piranha': 2}, {'bee':1}],
    'L12': [{'zombie': 2}, {'slime': 1}, {'skeleton': 6}, {'golem': 1}],
    'L13': [{'zombie': 2}, {'slime': 1}, {'skeleton': 6}, {'golem': 2}, {'bat': 2}],
    'L14': [{'zombie': 2}, {'slime': 1}, {'skeleton': 6}, {'golem': 2}]
}
