Game.GatedItemRepository = new Game.Repository('gatedItems', Game.Item);
Game.ItemRepository = new Game.Repository('items', Game.Item);

//TO DO: More Potions, including: 
// Invisibility
// Paralysis
// Fire immunity

// Magic Sensitivity
// Holy Potion, clears curses from items in inventory
// Protection potion

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

Game.ItemRepository.define('poison potion', {
    name: 'poison potion',
    character: '!',
    foreground: '#F2EC2D',
    rarity: 'COMMON',
    depth: 'ANY',
    mixins: [Game.ItemMixins.Edible, Game.ItemMixins.Throwable],
    itemLevel: 1
});

Game.ItemRepository.define('fire potion', {
    name: 'fire potion',
    character: '!',
    foreground: '#F2EC2D',
    rarity: 'COMMON',
    depth: 'ANY',
    mixins: [Game.ItemMixins.Edible, Game.ItemMixins.Throwable],
    itemLevel: 1
});

/* Game.ItemRepository.define('summoning potion', {
    name: 'summoning potion',
    character: '!',
    foreground: '#F2EC2D',
    potionEffect: null,
    mixins: [Game.ItemMixins.Edible, Game.ItemMixins.Throwable]
}); */

Game.ItemRepository.define('teleportation potion', {
    name: 'teleport potion',
    character: '!',
    foreground: '#F2EC2D',
    potionEffect: null,
    rarity: 'COMMON',
    depth: 'ANY',
    mixins: [Game.ItemMixins.Edible, Game.ItemMixins.Throwable],
    itemLevel: 1
});

Game.ItemRepository.define('knowledge potion', {
    name: 'knowledge potion',
    character: '!',
    foreground: '#F2EC2D',
    potionEffect: {
        duration: 30,
        name: "knowledgeable"
    },
    rarity: 'COMMON',
    depth: 'ANY',
    mixins: [Game.ItemMixins.Edible, Game.ItemMixins.Throwable],
    itemLevel: 2
});

Game.ItemRepository.define('health potion', {
    name: 'health potion',
    character: '!',
    foreground: '#F2EC2D',
    healthValue: 40,
    potionEffect: null,
    rarity: 'COMMON',
    depth: 'BAND',
    mixins: [Game.ItemMixins.Edible, Game.ItemMixins.Throwable],
    itemLevel: 1
});

Game.ItemRepository.define('shatter potion', {
    name: 'shatter potion',
    character: '!',
    foreground: '#F2EC2D',
    potionEffect: null,
    rarity: 'COMMON',
    depth: 'ANY',
    mixins: [Game.ItemMixins.Edible, Game.ItemMixins.Throwable],
    itemLevel: 1
});

Game.ItemRepository.define('darkness potion', {
    name: 'darkness potion',
    character: '!',
    foreground: '#F2EC2D',
    potionEffect: null,
    rarity: 'COMMON',
    depth: 'ANY',
    mixins: [Game.ItemMixins.Edible, Game.ItemMixins.Throwable],
    itemLevel: 1
});

Game.ItemRepository.define('head', {
    name: 'head',
    character: '\u25CB',
    headible: true,
    mixins: [Game.ItemMixins.Equippable, Game.ItemMixins.Throwable]
}, {
    disableRandomCreation: true
});

Game.ItemRepository.define('key', {
    name: 'key',
    character: '-',
    foreground: '#F2EC2D',
    throwBreakChance: 0,
    mixins: [Game.ItemMixins.Throwable]
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
    damageType: 'stab',
    rarity: 'COMMON',
    depth: 'ANY',
    mixins: [Game.ItemMixins.Equippable, Game.ItemMixins.Throwable],
    itemLevel: 3
}, {
    disableRandomCreation: false
});

Game.ItemRepository.define('javelin', {
    name: 'javelin',
    character: '\u16A8',
    foreground: '#F2EC2D',
    attackValue: 3,
    thrownAttackValue: 8,
    throwBreakChance: 100,
    strengthRequirement: 2,
    wieldable: true,
    stackable: true,
    damageType: 'stab',
    rarity: 'COMMON',
    depth: 'ANY',
    mixins: [Game.ItemMixins.Equippable, Game.ItemMixins.Throwable],
    itemLevel: 4
}, {
    disableRandomCreation: false
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
    damageType: 'stab',
    rarity: 'COMMON',
    depth: 'ANY',
    mixins: [Game.ItemMixins.Equippable, Game.ItemMixins.Throwable],
    itemLevel: 6
}, {
    disableRandomCreation: true
});

Game.ItemRepository.define('dagger', {
    name: 'dagger',
    character: '\u07D9',
    foreground: '#F2EC2D',
    attackValue: 2,
    thrownAttackValue: 3,
    strengthRequirement: 1,
    throwBreakChance: 20,
    wieldable: true,
    damageType: 'stab',
    rarity: 'UNCOM',
    depth: 'BAND',
    mixins: [Game.ItemMixins.Equippable, Game.ItemMixins.Throwable, Game.ItemMixins.Enchantable],
    itemLevel: 1
}, {
    disableRandomCreation: false
});

Game.ItemRepository.define('club', {
    name: 'club',
    character: '\u0669',
    foreground: '#F2EC2D',
    attackValue: 2,
    thrownAttackValue: 1,
    strengthRequirement: 1,
    wieldable: true,
    damageType: 'crush',
    rarity: 'UNCOM',
    depth: 'BAND',
    mixins: [Game.ItemMixins.Equippable, Game.ItemMixins.Throwable, Game.ItemMixins.Enchantable],
    itemLevel: 1
}, {
    disableRandomCreation: false
});

Game.ItemRepository.define('longsword', {
    name: 'longsword',
    character: '\u07D9',
    foreground: '#F2EC2D',
    attackValue: 5,
    thrownAttackValue: 3,
    strengthRequirement: 2,
    wieldable: true,
    damageType: 'slash',
    rarity: 'UNCOM',
    depth: 'ANY',
    mixins: [Game.ItemMixins.Equippable, Game.ItemMixins.Throwable, Game.ItemMixins.Enchantable],
    itemLevel: 1
}, {
    disableRandomCreation: false
});

Game.ItemRepository.define('greatclub', {
    name: 'greatclub',
    character: '\u07C9',
    foreground: '#F2EC2D',
    attackValue: 5,
    thrownAttackValue: 2,
    strengthRequirement: 2,
    wieldable: true,
    damageType: 'crush',
    rarity: 'UNCOM',
    depth: 'ANY',
    mixins: [Game.ItemMixins.Equippable, Game.ItemMixins.Throwable, Game.ItemMixins.Enchantable],
    itemLevel: 1
}, {
    disableRandomCreation: false
});

Game.ItemRepository.define('rapier', {
    name: 'rapier',
    character: '\u07D9',
    foreground: '#F2EC2D',
    attackValue: 5,
    thrownAttackValue: 3,
    strengthRequirement: 1,
    wieldable: true,
    damageType: 'pierce',
    rarity: 'RARE',
    depth: 'ANY',
    mixins: [Game.ItemMixins.Equippable, Game.ItemMixins.Throwable, Game.ItemMixins.Enchantable],
    itemLevel: 1
}, {
    disableRandomCreation: false
});

Game.ItemRepository.define('axe', {
    name: 'axe',
    character: '\u16B5',
    foreground: '#F2EC2D',
    attackValue: 6,
    thrownAttackValue: 3,
    strengthRequirement: 3,
    wieldable: true,
    damageType: 'slash',
    rarity: 'UNCOM',
    depth: 'ANY',
    mixins: [Game.ItemMixins.Equippable, Game.ItemMixins.Throwable, Game.ItemMixins.Enchantable],
    itemLevel: 2
}, {
    disableRandomCreation: false
});

Game.ItemRepository.define('broadsword', {
    name: 'broadsword',
    character: '\u16B5',
    foreground: '#F2EC2D',
    attackValue: 6,
    thrownAttackValue: 2,
    strengthRequirement: 3,
    wieldable: true,
    damageType: 'slash',
    rarity: 'UNCOM',
    depth: 'ANY',
    mixins: [Game.ItemMixins.Equippable, Game.ItemMixins.Throwable, Game.ItemMixins.Enchantable],
    itemLevel: 3
}, {
    disableRandomCreation: true
});

Game.ItemRepository.define('spear', {
    name: 'spear',
    character: '\u2191',
    foreground: '#F2EC2D',
    attackValue: 4,
    thrownAttackValue: 4,
    strengthRequirement: 1,
    wieldable: true,
    damageType: 'stab',
    rarity: 'UNCOM',
    depth: 'ANY',
    mixins: [Game.ItemMixins.Equippable, Game.ItemMixins.Throwable, Game.ItemMixins.Enchantable],
    itemLevel: 1
}, {
    disableRandomCreation: false
});

Game.ItemRepository.define('mace', {
    name: 'mace',
    character: '\u07C9',
    foreground: '#F2EC2D',
    attackValue: 4,
    thrownAttackValue: 2,
    strengthRequirement: 1,
    wieldable: true,
    damageType: 'crush',
    rarity: 'UNCOM',
    depth: 'BAND',
    mixins: [Game.ItemMixins.Equippable, Game.ItemMixins.Throwable, Game.ItemMixins.Enchantable],
    itemLevel: 1
}, {
    disableRandomCreation: false
});

Game.ItemRepository.define('scimitar', {
    name: 'scimitar',
    character: '\u1489',
    foreground: '#F2EC2D',
    attackValue: 4,
    thrownAttackValue: 2,
    strengthRequirement: 1,
    wieldable: true,
    damageType: 'slash',
    rarity: 'UNCOM',
    depth: 'BAND',
    mixins: [Game.ItemMixins.Equippable, Game.ItemMixins.Throwable, Game.ItemMixins.Enchantable],
    itemLevel: 1
}, {
    disableRandomCreation: false
});

//wands
Game.ItemRepository.define('wand of poison', {
    name: 'wand of poison',
    character: '~',
    foreground: '#F2EC2D',
    attackValue: 1,
    thrownAttackValue: 1,
    strengthRequirement: 1,
    wieldable: true,
    damageType: 'crush',
    useRange: [1,2],
    rarity: 'RARE',
    depth: 'ANY',
    mixins: [Game.ItemMixins.Equippable, Game.ItemMixins.Throwable, Game.ItemMixins.Enchantable, Game.ItemMixins.Usable],
    itemLevel: 2
}, {
    disableRandomCreation: false
});

Game.ItemRepository.define('wand of fire', {
    name: 'wand of fire',
    character: '~',
    foreground: '#F2EC2D',
    attackValue: 1,
    thrownAttackValue: 1,
    strengthRequirement: 1,
    wieldable: true,
    damageType: 'crush',
    useRange: [1,1],
    rarity: 'RARE',
    depth: 'ANY',
    mixins: [Game.ItemMixins.Equippable, Game.ItemMixins.Throwable, Game.ItemMixins.Enchantable, Game.ItemMixins.Usable],
    itemLevel: 3
}, {
    disableRandomCreation: false
});

Game.ItemRepository.define('wand of blinking', {
    name: 'wand of blinking',
    character: '~',
    foreground: '#F2EC2D',
    attackValue: 1,
    thrownAttackValue: 1,
    strengthRequirement: 1,
    wieldable: true,
    damageType: 'crush',
    useRange: [2,3],
    rarity: 'UNCOM',
    depth: 'ANY',
    mixins: [Game.ItemMixins.Equippable, Game.ItemMixins.Throwable, Game.ItemMixins.Enchantable, Game.ItemMixins.Usable],
    itemLevel: 1
}, {
    disableRandomCreation: false
});

// Wearables
Game.ItemRepository.define('leather', {
    name: 'leather armor',
    character: '[',
    foreground: '#F2EC2D',
    defenseValue: 2,
    strengthRequirement: 1,
    wearable: true,
    rarity: 'UNCOM',
    depth: 'BAND',
    mixins: [Game.ItemMixins.Equippable, Game.ItemMixins.Enchantable],
    itemLevel: 1
}, {
    disableRandomCreation: false
});

Game.ItemRepository.define('studded', {
    name: 'studded armor',
    character: '[',
    foreground: '#F2EC2D',
    defenseValue: 3,
    strengthRequirement: 1,
    wearable: true,
    rarity: 'UNCOM',
    depth: 'ANY',
    mixins: [Game.ItemMixins.Equippable, Game.ItemMixins.Enchantable],
    itemLevel: 1
}, {
    disableRandomCreation: false
});

Game.ItemRepository.define('scalemail', {
    name: 'scalemail',
    character: '[',
    foreground: '#F2EC2D',
    defenseValue: 4,
    strengthRequirement: 2,
    wearable: true,
    rarity: 'UNCOM',
    depth: 'ANY',
    mixins: [Game.ItemMixins.Equippable, Game.ItemMixins.Enchantable],
    itemLevel: 1
}, {
    disableRandomCreation: false
});

Game.ItemRepository.define('chainmail', {
    name: 'chainmail',
    character: '[',
    foreground: '#F2EC2D',
    defenseValue: 6,
    strengthRequirement: 2,
    wearable: true,
    rarity: 'UNCOM',
    depth: 'BAND',
    mixins: [Game.ItemMixins.Equippable, Game.ItemMixins.Enchantable],
    itemLevel: 1
}, {
    disableRandomCreation: false
});

Game.ItemRepository.define('splintmail', {
    name: 'splintmail',
    character: '[',
    foreground: '#F2EC2D',
    defenseValue: 7,
    strengthRequirement: 3,
    wearable: true,
    rarity: 'UNCOM',
    depth: 'ANY',
    mixins: [Game.ItemMixins.Equippable, Game.ItemMixins.Enchantable],
    itemLevel: 2
}, {
    disableRandomCreation: false
});

Game.ItemRepository.define('platemail', {
    name: 'platemail',
    character: '[',
    foreground: '#F2EC2D',
    defenseValue: 8,
    strengthRequirement: 4,
    wearable: true,
    rarity: 'UNCOM',
    depth: 'ANY',
    mixins: [Game.ItemMixins.Equippable, Game.ItemMixins.Enchantable],
    itemLevel: 3
}, {
    disableRandomCreation: false
});