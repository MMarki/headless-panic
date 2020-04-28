Game.GatedItemRepository = new Game.Repository('gatedItems', Game.Item);
Game.ItemRepository = new Game.Repository('items', Game.Item);

//TO DO: More Potions, including: 
// Fire
// Paralysis
// Magic sensitivity
// Holy Water, clears curses from items in invetory
// Darkness
// Fire immunity
// Invisibility
// Summoning potion

Game.GatedItemRepository.define('life potion', {
    name: 'life potion',
    character: '!',
    foreground: '#F2EC2D',
    healthValue: 100,
    potionEffect: null,
    mixins: [Game.ItemMixins.Edible, Game.ItemMixins.Throwable]
});

Game.GatedItemRepository.define('strength potion', {
    name: 'strength potion',
    character: '!',
    foreground: '#F2EC2D',
    potionEffect: null,
    mixins: [Game.ItemMixins.Edible, Game.ItemMixins.Throwable]
});

Game.GatedItemRepository.define('enchantment potion', {
    name: 'enchantment potion',
    character: '!',
    foreground: '#F2EC2D',
    potionEffect: null,
    mixins: [Game.ItemMixins.Edible, Game.ItemMixins.Throwable]
});

Game.ItemRepository.define('poison potion', {
    name: 'poison potion',
    character: '!',
    foreground: '#F2EC2D',
    potionEffect: {
        duration: 10,
        name: "poisoned"
    },
    mixins: [Game.ItemMixins.Edible, Game.ItemMixins.Throwable]
});

Game.ItemRepository.define('teleportation potion', {
    name: 'teleportation potion',
    character: '!',
    foreground: '#F2EC2D',
    potionEffect: null,
    mixins: [Game.ItemMixins.Edible, Game.ItemMixins.Throwable]
});

Game.ItemRepository.define('knowledge potion', {
    name: 'knowledge potion',
    character: '!',
    foreground: '#F2EC2D',
    potionEffect: {
        duration: 30,
        name: "knowledgeable"
    },
    mixins: [Game.ItemMixins.Edible, Game.ItemMixins.Throwable]
});

Game.ItemRepository.define('health potion', {
    name: 'health potion',
    character: '!',
    foreground: '#F2EC2D',
    healthValue: 40,
    potionEffect: null,
    mixins: [Game.ItemMixins.Edible, Game.ItemMixins.Throwable]
});

Game.ItemRepository.define('shatter potion', {
    name: 'shatter potion',
    character: '!',
    foreground: '#F2EC2D',
    potionEffect: null,
    mixins: [Game.ItemMixins.Edible, Game.ItemMixins.Throwable]
});

Game.ItemRepository.define('head', {
    name: 'head',
    character: '\u25CB',
    headible: true,
    mixins: [Game.ItemMixins.Equippable, Game.ItemMixins.Throwable]
}, {
    disableRandomCreation: true
});

// Weapons
Game.ItemRepository.define('dart', {
    name: 'dart',
    character: '\u16DA',
    foreground: '#F2EC2D',
    attackValue: 1,
    thrownAttackValue: 4,
    throwBreakChance: 100,
    wieldable: true,
    stackable: true,
    mixins: [Game.ItemMixins.Equippable, Game.ItemMixins.Throwable]
}, {
    disableRandomCreation: true
});

Game.ItemRepository.define('javelin', {
    name: 'javelin',
    character: '\u16A8',
    foreground: '#F2EC2D',
    attackValue: 2,
    thrownAttackValue: 6,
    throwBreakChance: 100,
    wieldable: true,
    stackable: true,
    mixins: [Game.ItemMixins.Equippable, Game.ItemMixins.Throwable]
}, {
    disableRandomCreation: true
});

Game.ItemRepository.define('incendiary dart', {
    name: 'incendiary dart',
    character: '\u16DB',
    foreground: '#F2EC2D',
    attackValue: 1,
    thrownAttackValue: 4,
    throwBreakChance: 100,
    wieldable: true,
    stackable: true,
    mixins: [Game.ItemMixins.Equippable, Game.ItemMixins.Throwable]
}, {
    disableRandomCreation: true
});

Game.ItemRepository.define('dagger', {
    name: 'dagger',
    character: '\u07D9',
    foreground: '#F2EC2D',
    attackValue: 3,
    thrownAttackValue: 3,
    wieldable: true,
    mixins: [Game.ItemMixins.Equippable, Game.ItemMixins.Throwable]
}, {
    disableRandomCreation: true
});

Game.ItemRepository.define('sword', {
    name: 'sword',
    character: '\u07D9',
    foreground: '#F2EC2D',
    attackValue: 6,
    thrownAttackValue: 3,
    wieldable: true,
    mixins: [Game.ItemMixins.Equippable, Game.ItemMixins.Throwable]
}, {
    disableRandomCreation: true
});

Game.ItemRepository.define('axe', {
    name: 'axe',
    character: '\u16B5',
    foreground: '#F2EC2D',
    attackValue: 6,
    thrownAttackValue: 3,
    wieldable: true,
    mixins: [Game.ItemMixins.Equippable, Game.ItemMixins.Throwable]
}, {
    disableRandomCreation: true
});

Game.ItemRepository.define('spear', {
    name: 'spear',
    character: '\u2191',
    foreground: '#F2EC2D',
    attackValue: 5,
    thrownAttackValue: 5,
    wieldable: true,
    mixins: [Game.ItemMixins.Equippable, Game.ItemMixins.Throwable]
}, {
    disableRandomCreation: true
});

Game.ItemRepository.define('lance', {
    name: 'lance',
    character: '\u2191',
    foreground: '#F2EC2D',
    attackValue: 6,
    thrownAttackValue: 4,
    wieldable: true,
    mixins: [Game.ItemMixins.Equippable, Game.ItemMixins.Throwable]
}, {
    disableRandomCreation: true
});


// Wearables
Game.ItemRepository.define('leather', {
    name: 'leather armor',
    character: '[',
    foreground: '#F2EC2D',
    defenseValue: 2,
    wearable: true,
    mixins: [Game.ItemMixins.Equippable]
}, {
    disableRandomCreation: true
});

Game.ItemRepository.define('scalemail', {
    name: 'scalemail',
    character: '[',
    foreground: '#F2EC2D',
    defenseValue: 4,
    wearable: true,
    mixins: [Game.ItemMixins.Equippable]
}, {
    disableRandomCreation: true
});

Game.ItemRepository.define('chainmail', {
    name: 'chainmail',
    character: '[',
    foreground: '#F2EC2D',
    defenseValue: 6,
    wearable: true,
    mixins: [Game.ItemMixins.Equippable]
}, {
    disableRandomCreation: true
});

Game.ItemRepository.define('platemail', {
    name: 'platemail',
    character: '[',
    foreground: '#F2EC2D',
    defenseValue: 8,
    wearable: true,
    mixins: [Game.ItemMixins.Equippable]
}, {
    disableRandomCreation: true
});