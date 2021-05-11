Game.ItemMixins = {};

// Edible mixins
Game.ItemMixins.Edible = {
    name: 'Edible',
    init: function(template) {
        // Number of points to add to health
        this._name = template['name'];
        this._healthValue = template['healthValue'] || 0;
        this._potionEffect = null
        let potionEffect = template['potionEffect'] || null
        if (potionEffect !== null){
            this._potionEffect = new Game.Effect(potionEffect.duration, potionEffect.name);
        } else {
            this._potionEffect = null;
        }
    },
    eat: function(entity) {
        if (this._potionEffect !== null){
            entity.setEffect(this._potionEffect);
        } else if (entity.hasMixin('Bleeder')) {
            if (this._name === "health potion"){
                entity.modifyHPBy(this._healthValue);
            } else if (this._name === "life potion"){
                entity.modifyMaxHPBy(Math.floor(entity.getMaxHP()/5));
                entity.modifyHPBy(this._healthValue);
            }
        }
        if (this._name === 'shatter potion'){
            let x = entity.getX();
            let y = entity.getY();
            let map = entity.getMap();
            map.shatter(x,y);
            Game.sendMessage(entity, 'The %s creates a shockwave!', this._name);
        } else if (this._name === 'fire potion'){
            let x = entity.getX();
            let y = entity.getY();
            let map = entity.getMap();
            let tempList = []
            tempList.push({x: x, y: y});
            map.cellGrow(tempList, 'fireTile', 10);
        } else if (this._name === 'poison potion'){
            let x = entity.getX();
            let y = entity.getY();
            let map = entity.getMap();
            let tempList = []
            tempList.push({x: x, y: y});
            map.gasGrow(tempList, 'poisonTile', 12);
        } else if (this._name === 'darkness potion'){
            let x = entity.getX();
            let y = entity.getY();
            let map = entity.getMap();
            let tempList = []
            tempList.push({x: x, y: y});
            map.gasGrow(tempList, 'darknessTile', 9);
        } else if (this._name === 'teleport potion') {
            let x = entity.getX();
            let y = entity.getY();
            let newX = 0;
            let newY = 0;

            while (!entity.tryMoveTeleport(x + newX, y + newY) ){
                newX = Math.floor(Math.random() * 80) - 40;
                newY = Math.floor(Math.random() * 40) - 20;
            }
            
            entity.setPosition(x + newX, y + newY);
            Game.sendMessage(entity, 'You are teleported!');
        } else if (entity.hasMixin('Attacker') && this._name === 'strength potion'){
            entity.incrementStrength();
        }
    },
    describe: function() {
        return this._name;
    }
};

Game.ItemMixins.Equippable = {
    name: 'Equippable',
    init: function(template) {
        this._attackValue = template['attackValue'] || 0;
        this._defenseValue = template['defenseValue'] || 0;
        this._damageType = template['damageType'] || 'crush';
        this._wieldable = template['wieldable'] || false;
        this._wearable = template['wearable'] || false;
        this._headible = template['headible'] || false;
        this._headHits = template['headHits'] || 1;
        this._power = template['power'] || '';
        this._strengthRequirement = template['strengthRequirement'] || 1;
    },
    getAttackValue: function() {
        return this._attackValue;
    },
    getDefenseValue: function() {
        return this._defenseValue;
    },
    getDamageType: function() {
        return this._damageType;
    },
    isWieldable: function() {
        return this._wieldable;
    },
    isWearable: function() {
        return this._wearable;
    },
    isHeadible: function() {
        return this._headible;
    },
    describe: function() {
        return this._name;
    },
    getHeadHits() {
        return this._headHits;
    },
    getStrengthRequirement() {
        return this._strengthRequirement;
    },
    getPowerDescription() {
        return this._power;
    }
};

// Throwable mixin
Game.ItemMixins.Throwable = {
    name: 'Throwable',
    init: function(template) {
        this._thrownAttackValue = template['thrownAttackValue'] || 0;
        if (template['throwBreakChance'] !== undefined){
            this._throwBreakChance = template['throwBreakChance'];
        } else {
            this._throwBreakChance = 40;
        }
        this._stackable = template['stackable'] || false;
        this._quantity = template['quantity'] || 1;
    },
    getThrownAttackValue: function() {
        return this._thrownAttackValue;
    },
    describe: function() {
            return this._name;
    },
    isStackable: function(){
        return this._stackable;
    },
    getStackQuantity: function(){
        return this._quantity;
    },
    setStackQuantity: function(amount){
        this._quantity = amount;
    }
};

// Enchantable mixin
Game.ItemMixins.Enchantable = {
    name: 'Enchantable',
    init: function(template) {
        this._enchantValue = template['enchantValue'] || 0;
    },
    getEnchantValue: function() {
        return this._enchantValue;
    },
    incrementEnchantValue: function() {
        this._enchantValue += 1;
    }
};

// Usable mixin
Game.ItemMixins.Usable = {
    name: 'Usable',
    init: function(template) {
        this._maxUses = Game.pickRandomElement(template['useRange']) || 1;
        this._uses = this._maxUses;
    },
    getUses: function() {
        return this._uses;
    },
    getMaxUses: function() {
        return this._maxUses;
    },
    setUses: function(inUses) {
        this._uses = inUses;
    }
};