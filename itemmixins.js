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