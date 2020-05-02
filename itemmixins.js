Game.ItemMixins = {};

// Edible mixins
Game.ItemMixins.Edible = {
    name: 'Edible',
    init: function(template) {
        // Number of points to add to health
        this._name = template['name'];
        this._healthValue = template['healthValue'] || 0;
        this._potionEffect = null
        var potionEffect = template['potionEffect'] || null
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
                entity.modifyMaxHPBy(Math.floor(target.getMaxHP()/4));
                entity.modifyHPBy(this._healthValue);
            }
        }
        if (this._name === 'shatter potion'){
            var x = entity.getX();
            var y = entity.getY();
            var map = entity.getMap();
            map.shatter(x,y);
        } else if (this._name === 'summoning potion'){
            entity.summon('rat');
        } else if (this._name === 'teleportation potion') {
            var x = entity.getX();
            var y = entity.getY();
            var newX = 0;
            var newY = 0;

            while (!entity.tryMoveNoAttack(x + newX, y + newY) ){
                newX = Math.floor(Math.random() * 80) - 40;
                newY = Math.floor(Math.random() * 40) - 20;
            }

            entity.setPosition(x + newX, y + newY);
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
        this._wieldable = template['wieldable'] || false;
        this._wearable = template['wearable'] || false;
        this._headible = template['headible'] || false;
        this._headHits = template['headHits'] || 1;
        this._strengthRequirement = template['strengthRequirement'] || 1;
    },
    getAttackValue: function() {
        return this._attackValue;
    },
    getDefenseValue: function() {
        return this._defenseValue;
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
    }
};

// Throwable mixin
Game.ItemMixins.Throwable = {
    name: 'Throwable',
    init: function(template) {
        this._thrownAttackValue = template['thrownAttackValue'] || 0;
        this._throwBreakChance = template['throwBreakChance'] || 20;
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