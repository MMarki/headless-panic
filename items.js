Game.GatedItemRepository = new Game.Repository('gatedItems', Game.Item);
Game.ItemRepository = new Game.Repository('items', Game.Item);

Game.GatedItemRepository.define('life potion', {
    name: 'life potion',
    character: '!',
    foreground: Game.Colors.yellow,
    healthValue: 100,
    potionEffect: null,
    mixins: [Game.ItemMixins.Edible, Game.ItemMixins.Throwable]
});

Game.GatedItemRepository.define('strength potion', {
    name: 'strength potion',
    character: '!',
    foreground: Game.Colors.yellow,
    potionEffect: null,
    mixins: [Game.ItemMixins.Edible, Game.ItemMixins.Throwable]
});

Game.ItemRepository.define('haste potion', {
    name: 'haste potion',
    character: '!',
    foreground: Game.Colors.yellow,
    potionEffect: {
        duration: 20,
        name: "hasted"
    },
    rarity: 'COMMON',
    depth: 'ANY',
    mixins: [Game.ItemMixins.Edible, Game.ItemMixins.Throwable],
    itemLevel: 1
});

Game.ItemRepository.define('fireproof potion', {
    name: 'fireproof potion',
    character: '!',
    foreground: Game.Colors.yellow,
    potionEffect: {
        duration: 20,
        name: "fireproof"
    },
    rarity: 'COMMON',
    depth: 'ANY',
    mixins: [Game.ItemMixins.Edible, Game.ItemMixins.Throwable],
    itemLevel: 1
});

Game.ItemRepository.define('poison potion', {
    name: 'poison potion',
    character: '!',
    foreground: Game.Colors.yellow,
    rarity: 'COMMON',
    depth: 'ANY',
    mixins: [Game.ItemMixins.Edible, Game.ItemMixins.Throwable],
    itemLevel: 1
});

Game.ItemRepository.define('fire potion', {
    name: 'fire potion',
    character: '!',
    foreground: Game.Colors.yellow,
    rarity: 'COMMON',
    depth: 'ANY',
    mixins: [Game.ItemMixins.Edible, Game.ItemMixins.Throwable],
    itemLevel: 1
});

Game.ItemRepository.define('teleportation potion', {
    name: 'teleport potion',
    character: '!',
    foreground: Game.Colors.yellow,
    potionEffect: null,
    rarity: 'COMMON',
    depth: 'ANY',
    mixins: [Game.ItemMixins.Edible, Game.ItemMixins.Throwable],
    itemLevel: 1
});

Game.ItemRepository.define('detection potion', {
    name: 'detection potion',
    character: '!',
    foreground: Game.Colors.yellow,
    potionEffect: {
        duration: 30,
        name: "detecting"
    },
    rarity: 'COMMON',
    depth: 'ANY',
    mixins: [Game.ItemMixins.Edible, Game.ItemMixins.Throwable],
    itemLevel: 1
});

Game.ItemRepository.define('knowledge potion', {
    name: 'knowledge potion',
    character: '!',
    foreground: Game.Colors.yellow,
    rarity: 'COMMON',
    depth: 'ANY',
    mixins: [Game.ItemMixins.Edible, Game.ItemMixins.Throwable],
    itemLevel: 2
});

Game.ItemRepository.define('health potion', {
    name: 'health potion',
    character: '!',
    foreground: Game.Colors.yellow,
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
    foreground: Game.Colors.yellow,
    potionEffect: null,
    rarity: 'COMMON',
    depth: 'ANY',
    mixins: [Game.ItemMixins.Edible, Game.ItemMixins.Throwable],
    itemLevel: 1
});

Game.ItemRepository.define('darkness potion', {
    name: 'darkness potion',
    character: '!',
    foreground: Game.Colors.yellow,
    potionEffect: null,
    rarity: 'COMMON',
    depth: 'ANY',
    mixins: [Game.ItemMixins.Edible, Game.ItemMixins.Throwable],
    itemLevel: 1
});

Game.ItemRepository.define('invisibility potion', {
    name: 'invisibility potion',
    character: '!',
    foreground: Game.Colors.yellow,
    potionEffect: {
        duration: 50,
        name: "invisible"
    },
    rarity: 'COMMON',
    depth: 'ANY',
    mixins: [Game.ItemMixins.Edible, Game.ItemMixins.Throwable],
    itemLevel: 1
});

Game.ItemRepository.define('head', {
    name: 'head',
    character: '\u25CB',
    headible: true,
    mixins: [Game.ItemMixins.Equippable, Game.ItemMixins.Throwable],
    power: ''
}, {
    disableRandomCreation: true
});

Game.ItemRepository.define('key', {
    name: 'key',
    character: '-',
    foreground: Game.Colors.yellow,
    throwBreakChance: 0,
    mixins: [Game.ItemMixins.Throwable]
}, {
    disableRandomCreation: true
});

Game.ItemRepository.define('gold', {
    name: 'gold',
    character: '*',
    foreground: Game.Colors.yellow,
}, {
    disableRandomCreation: true
});

// Weapons
Game.ItemRepository.define('dart', {
    name: 'dart',
    character: '\u16DA',
    foreground: Game.Colors.yellow,
    attackValue: 1,
    thrownAttackValue: 3,
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
    foreground: Game.Colors.yellow,
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

Game.ItemRepository.define('dagger', {
    name: 'dagger',
    character: '\u07D9',
    foreground: Game.Colors.yellow,
    attackValue: 2,
    thrownAttackValue: 3,
    strengthRequirement: 1,
    throwBreakChance: 20,
    wieldable: true,
    damageType: 'stab',
    rarity: 'UNCOM',
    depth: 'BAND',
    mixins: [Game.ItemMixins.Equippable, Game.ItemMixins.Throwable],
    itemLevel: 1
}, {
    disableRandomCreation: false
});

Game.ItemRepository.define('club', {
    name: 'club',
    character: '\u0669',
    foreground: Game.Colors.yellow,
    attackValue: 2,
    thrownAttackValue: 1,
    strengthRequirement: 1,
    wieldable: true,
    damageType: 'crush',
    rarity: 'UNCOM',
    depth: 'BAND',
    mixins: [Game.ItemMixins.Equippable, Game.ItemMixins.Throwable],
    itemLevel: 1
}, {
    disableRandomCreation: false
});

Game.ItemRepository.define('longsword', {
    name: 'longsword',
    character: '\u07D9',
    foreground: Game.Colors.yellow,
    attackValue: 6,
    thrownAttackValue: 3,
    strengthRequirement: 2,
    wieldable: true,
    damageType: 'slash',
    rarity: 'UNCOM',
    depth: 'ANY',
    mixins: [Game.ItemMixins.Equippable, Game.ItemMixins.Throwable],
    itemLevel: 1
}, {
    disableRandomCreation: false
});

Game.ItemRepository.define('greatclub', {
    name: 'greatclub',
    character: '\u07C9',
    foreground: Game.Colors.yellow,
    attackValue: 6,
    thrownAttackValue: 2,
    strengthRequirement: 2,
    wieldable: true,
    damageType: 'crush',
    rarity: 'UNCOM',
    depth: 'ANY',
    mixins: [Game.ItemMixins.Equippable, Game.ItemMixins.Throwable],
    itemLevel: 1
}, {
    disableRandomCreation: false
});

Game.ItemRepository.define('warhammer', {
    name: 'warhammer',
    character: '\u0164',
    foreground: Game.Colors.yellow,
    attackValue: 9,
    thrownAttackValue: 4,
    strengthRequirement: 4,
    wieldable: true,
    damageType: 'crush',
    rarity: 'RARE',
    depth: 'ANY',
    mixins: [Game.ItemMixins.Equippable, Game.ItemMixins.Throwable],
    itemLevel: 2
}, {
    disableRandomCreation: false
});

Game.ItemRepository.define('greatsword', {
    name: 'greatsword',
    character: '\u012C',
    foreground: Game.Colors.yellow,
    attackValue: 9,
    thrownAttackValue: 5,
    strengthRequirement: 4,
    wieldable: true,
    damageType: 'slash',
    rarity: 'RARE',
    depth: 'ANY',
    mixins: [Game.ItemMixins.Equippable, Game.ItemMixins.Throwable],
    itemLevel: 2
}, {
    disableRandomCreation: false
});

Game.ItemRepository.define('war pike', {
    name: 'war pike',
    character: '\u2909',
    foreground: Game.Colors.yellow,
    attackValue: 9,
    thrownAttackValue: 6,
    strengthRequirement: 4,
    wieldable: true,
    damageType: 'stab',
    rarity: 'RARE',
    depth: 'ANY',
    mixins: [Game.ItemMixins.Equippable, Game.ItemMixins.Throwable],
    itemLevel: 2
}, {
    disableRandomCreation: false
});

Game.ItemRepository.define('rapier', {
    name: 'rapier',
    character: '\u07D9',
    foreground: Game.Colors.yellow,
    attackValue: 5,
    thrownAttackValue: 3,
    strengthRequirement: 1,
    wieldable: true,
    damageType: 'pierce',
    rarity: 'RARE',
    depth: 'ANY',
    mixins: [Game.ItemMixins.Equippable, Game.ItemMixins.Throwable],
    itemLevel: 1
}, {
    disableRandomCreation: false
});

Game.ItemRepository.define('axe', {
    name: 'axe',
    character: '\u16B5',
    foreground: Game.Colors.yellow,
    attackValue: 7,
    thrownAttackValue: 3,
    strengthRequirement: 3,
    wieldable: true,
    damageType: 'slash',
    rarity: 'UNCOM',
    depth: 'ANY',
    mixins: [Game.ItemMixins.Equippable, Game.ItemMixins.Throwable],
    itemLevel: 2
}, {
    disableRandomCreation: false
});

Game.ItemRepository.define('spear', {
    name: 'spear',
    character: '\u2191',
    foreground: Game.Colors.yellow,
    attackValue: 4,
    thrownAttackValue: 4,
    strengthRequirement: 1,
    wieldable: true,
    damageType: 'stab',
    rarity: 'UNCOM',
    depth: 'ANY',
    mixins: [Game.ItemMixins.Equippable, Game.ItemMixins.Throwable],
    itemLevel: 1
}, {
    disableRandomCreation: false
});

Game.ItemRepository.define('mace', {
    name: 'mace',
    character: '\u26B4',
    foreground: Game.Colors.yellow,
    attackValue: 4,
    thrownAttackValue: 2,
    strengthRequirement: 1,
    wieldable: true,
    damageType: 'crush',
    rarity: 'UNCOM',
    depth: 'BAND',
    mixins: [Game.ItemMixins.Equippable, Game.ItemMixins.Throwable],
    itemLevel: 1
}, {
    disableRandomCreation: false
});

Game.ItemRepository.define('scimitar', {
    name: 'scimitar',
    character: '\u26B8',
    foreground: Game.Colors.yellow,
    attackValue: 4,
    thrownAttackValue: 2,
    strengthRequirement: 1,
    wieldable: true,
    damageType: 'slash',
    rarity: 'UNCOM',
    depth: 'BAND',
    mixins: [Game.ItemMixins.Equippable, Game.ItemMixins.Throwable],
    itemLevel: 1
}, {
    disableRandomCreation: false
});

//wands
Game.ItemRepository.define('wand of poison', {
    name: 'wand of poison',
    character: '\u26B5',
    foreground: Game.Colors.yellow,
    attackValue: 1,
    thrownAttackValue: 1,
    strengthRequirement: 1,
    damageType: 'crush',
    useRange: [1,2],
    rarity: 'RARE',
    depth: 'ANY',
    mixins: [Game.ItemMixins.Throwable, Game.ItemMixins.Enchantable, Game.ItemMixins.Usable],
    itemLevel: 2
}, {
    disableRandomCreation: false
});

Game.ItemRepository.define('wand of fire', {
    name: 'wand of fire',
    character: '\u26B5',
    foreground: Game.Colors.yellow,
    attackValue: 1,
    thrownAttackValue: 1,
    strengthRequirement: 1,
    damageType: 'crush',
    useRange: [1,1],
    rarity: 'RARE',
    depth: 'ANY',
    mixins: [Game.ItemMixins.Throwable, Game.ItemMixins.Enchantable, Game.ItemMixins.Usable],
    itemLevel: 3
}, {
    disableRandomCreation: false
});

Game.ItemRepository.define('wand of blinking', {
    name: 'wand of blinking',
    character: '\u26B5',
    foreground: Game.Colors.yellow,
    attackValue: 1,
    thrownAttackValue: 1,
    strengthRequirement: 1,
    damageType: 'crush',
    useRange: [2,3],
    rarity: 'UNCOM',
    depth: 'ANY',
    mixins: [Game.ItemMixins.Throwable, Game.ItemMixins.Enchantable, Game.ItemMixins.Usable],
    itemLevel: 1
}, {
    disableRandomCreation: false
});

Game.ItemRepository.define('wand of slowing', {
    name: 'wand of slowing',
    character: '\u26B5',
    foreground: Game.Colors.yellow,
    attackValue: 1,
    thrownAttackValue: 1,
    strengthRequirement: 1,
    damageType: 'crush',
    useRange: [1,2],
    rarity: 'UNCOM',
    depth: 'ANY',
    mixins: [Game.ItemMixins.Throwable, Game.ItemMixins.Enchantable, Game.ItemMixins.Usable],
    itemLevel: 1
}, {
    disableRandomCreation: false
});

Game.ItemRepository.define('wand of digging', {
    name: 'wand of digging',
    character: '\u26B5',
    foreground: Game.Colors.yellow,
    attackValue: 1,
    thrownAttackValue: 1,
    strengthRequirement: 1,
    damageType: 'crush',
    useRange: [2,3],
    rarity: 'UNCOM',
    depth: 'ANY',
    mixins: [Game.ItemMixins.Throwable, Game.ItemMixins.Enchantable, Game.ItemMixins.Usable],
    itemLevel: 1
}, {
    disableRandomCreation: false
});

// Wearables
Game.ItemRepository.define('leather', {
    name: 'leather armor',
    character: '[',
    foreground: Game.Colors.yellow,
    defenseValue: 1,
    strengthRequirement: 1,
    wearable: true,
    rarity: 'UNCOM',
    depth: 'BAND',
    mixins: [Game.ItemMixins.Equippable],
    itemLevel: 1
}, {
    disableRandomCreation: false
});

Game.ItemRepository.define('studded', {
    name: 'studded armor',
    character: '[',
    foreground: Game.Colors.yellow,
    defenseValue: 2,
    strengthRequirement: 1,
    wearable: true,
    rarity: 'UNCOM',
    depth: 'ANY',
    mixins: [Game.ItemMixins.Equippable],
    itemLevel: 1
}, {
    disableRandomCreation: false
});

Game.ItemRepository.define('scalemail', {
    name: 'scalemail',
    character: '[',
    foreground: Game.Colors.yellow,
    defenseValue: 4,
    strengthRequirement: 2,
    wearable: true,
    rarity: 'UNCOM',
    depth: 'ANY',
    mixins: [Game.ItemMixins.Equippable],
    itemLevel: 1
}, {
    disableRandomCreation: false
});

Game.ItemRepository.define('chainmail', {
    name: 'chainmail',
    character: '[',
    foreground: Game.Colors.yellow,
    defenseValue: 5,
    strengthRequirement: 2,
    wearable: true,
    rarity: 'UNCOM',
    depth: 'BAND',
    mixins: [Game.ItemMixins.Equippable],
    itemLevel: 1
}, {
    disableRandomCreation: false
});

Game.ItemRepository.define('splintmail', {
    name: 'splintmail',
    character: '[',
    foreground: Game.Colors.yellow,
    defenseValue: 7,
    strengthRequirement: 3,
    wearable: true,
    rarity: 'UNCOM',
    depth: 'ANY',
    mixins: [Game.ItemMixins.Equippable],
    itemLevel: 2
}, {
    disableRandomCreation: false
});

Game.ItemRepository.define('platemail', {
    name: 'platemail',
    character: '[',
    foreground: Game.Colors.yellow,
    defenseValue: 8,
    strengthRequirement: 4,
    wearable: true,
    rarity: 'UNCOM',
    depth: 'ANY',
    mixins: [Game.ItemMixins.Equippable],
    itemLevel: 3
}, {
    disableRandomCreation: false
});