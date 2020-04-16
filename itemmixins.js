Game.ItemMixins = {};

// Edible mixins
Game.ItemMixins.Edible = {
    name: 'Edible',
    init: function(template) {
        // Number of points to add to health
        this._foodValue = template['foodValue'] || 5;
    },
    eat: function(entity) {
        if (entity.hasMixin('Bleeder')) {
            entity.modifyHPBy(this._foodValue);
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
    }
};