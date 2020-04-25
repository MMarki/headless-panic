Game.EntityMixins = {};

Game.EntityMixins.PlayerActor = {
    name: 'PlayerActor',
    groupName: 'Actor',
    act: function() {
        if (this._acting) {
            return;
        }
        this._acting = true;
        this.addTurnBleed();
        this.handleEffects();
        // Detect if the game is over
        if (this.getHp() < 1) {
            Game.Screen.playScreen.setGameEnded(true);
            // Send a last message to the player
            Game.sendMessage(this, 'You have died... Press [Enter] to continue!');
        }
        // Re-render the screen
        Game.refresh();
        // Lock the engine and wait asynchronously
        // for the player to press a key.
        this.getMap().getEngine().lock();  
        // Clear the message queue
        this.clearMessages();
        this._acting = false; 
    }
}

Game.EntityMixins.TaskActor = {
    name: 'TaskActor',
    groupName: 'Actor',
    init: function(template) {
        // Load tasks
        this._tasks = template['tasks'] || ['wander']; 
    },
    act: function() {
        var stopActor = this.handleEffects();
        if (stopActor === 1) {return;}

        // Iterate through all our tasks
        for (var i = 0; i < this._tasks.length; i++) {
            if (this.canDoTask(this._tasks[i])) {
                // If we can perform the task, execute the function for it.
                this[this._tasks[i]]();
                return;
            }
        }
    },
    canDoTask: function(task) {
        if (task === 'hunt') {
            return this.hasMixin('Sight') && this.canSee(this.getMap().getPlayer());
        } else if (task === 'wander') {
            return true;
        } else {
            throw new Error('Tried to perform undefined task ' + task);
        }
    },
    hunt: function() {
        var player = this.getMap().getPlayer();

        // If we are adjacent to the player, then attack instead of hunting.
        var offsets = Math.abs(player.getX() - this.getX()) + 
            Math.abs(player.getY() - this.getY());
        if (offsets === 1) {
            if (this.hasMixin('Attacker')) {
                this.attack(player);
                return;
            }
        }

        // Generate the path and move to the first tile.
        var source = this;
        var path = new ROT.Path.AStar(player.getX(), player.getY(), function(x, y) {
            // If an entity is present at the tile, can't move there.
            var entity = source.getMap().getEntityAt(x, y);
            if (entity && entity !== player && entity !== source) {
                return false;
            }
            return source.getMap().getTile(x, y).isWalkable();
        }, {topology: 4});
        // Once we've gotten the path, we want to move to the second cell that is passed in the callback (the first is the entity's strting point)
        var count = 0;
        path.compute(source.getX(), source.getY(), function(x, y) {
            if (count == 1) {
                source.tryMove(x, y);
            }
            count++;
        });
    },
    wander: function() {
        // Flip coin to determine if moving by 1 in the positive or negative direction
        var moveOffset = (Math.round(Math.random()) === 1) ? 1 : -1;
        // Flip coin to determine if moving in x direction or y direction
        if (Math.round(Math.random()) === 1) {
            this.tryMove(this.getX() + moveOffset, this.getY());
        } else {
            this.tryMove(this.getX(), this.getY() + moveOffset);
        }
    }
};

Game.EntityMixins.FungusActor = {
    name: 'FungusActor',
    groupName: 'Actor',
    init: function() {
        this._growthsRemaining = 5;
    },
    act: function() { 
        // Check if we are going to try growing this turn
        if (this._growthsRemaining > 0) {
            if (Math.random() <= 0.02) {
                // Generate the coordinates of a random adjacent square by
                // generating an offset between [-1, 0, 1] for both the x and
                // y directions. To do this, we generate a number from 0-2 and then
                // subtract 1.
                var xOffset = Math.floor(Math.random() * 3) - 1;
                var yOffset = Math.floor(Math.random() * 3) - 1;
                // Make sure we aren't trying to spawn on the same tile as us
                if (xOffset != 0 || yOffset != 0) {
                    // Check if we can actually spawn at that location, and if so
                    // then we grow!
                    if (this.getMap().isEmptyFloor(this.getX() + xOffset,
                                                   this.getY() + yOffset)) {
                        var entity = Game.EntityRepository.create('fungus');
                        entity.setX(this.getX() + xOffset);
                        entity.setY(this.getY() + yOffset);
                        this.getMap().addEntity(entity);
                        this._growthsRemaining--;
                        // Send a message nearby!
                        Game.sendMessageNearby(this.getMap(), entity.getX(), entity.getY(),'The fungus is spreading!');
                    }
                }
            }
        }
    }
}

Game.EntityMixins.Destructible = {
    name: 'Destructible',
    init: function(template) {
        this._maxHp = template['maxHp'] || 10;
        // We allow taking in health from the template in case we want the entity to start with a different amount of HP than the  max specified.
        this._hp = template['hp'] || this._maxHp;
        this._defenseValue = template['defenseValue'] || 0;
    },
    getHp: function() {
        return this._hp;
    },
    getMaxHp: function() {
        return this._maxHp;
    },
    getDefenseValue: function() {
        var modifier = 0;
        // If we can equip items, then have to take into 
        // consideration weapon and armor
        if (this.hasMixin(Game.EntityMixins.Equipper)) {
            if (this.getArmor()) {
                modifier += this.getArmor().getDefenseValue();
            }
        }
        return this._defenseValue + modifier;
    },
    takeDamage: function(attacker, damage) {
        if (this.hasMixin(Game.EntityMixins.Bleeder)){
            var myHead = this.getHead()
            if (myHead !== null){
                //drop the item that is equipped on the head of the player
                var headIndex = this.getHeadIndex();
                this.unhead();
                this.removeItem(headIndex);
                Game.sendMessage(this, "Your head falls off");
                return true;
            } else {
                this._hp -= damage;
            }
        } else {
            this._hp -= damage;
        }
        
        // If have 0 or less HP, then remove ourseles from the map
        if (this._hp <= 0) {
            this._hp = 0;
            Game.sendMessage(attacker, 'You kill the %s!', [this.getName()]);
            if (this.hasMixin(Game.EntityMixins.HeadDropper)) {
                this.tryDropHead();
            }
            if (this.hasMixin(Game.EntityMixins.PlayerActor)) {
                this.act();
            } else {
                console.log("killing" + this);
                this.getMap().removeEntity(this);
            }
            return 1;
        }
        return 0;
    }
}

Game.EntityMixins.Attacker = {
    name: 'Attacker',
    groupName: 'Attacker',
    init: function(template) {
        this._attackValue = template['attackValue'] || 1;
        this._accuracyValue = template['accuracyValue'] || 70;
    },
    getAttackValue: function() {
        var modifier = 0;
        // If we can equip items, then have to take into 
        // consideration weapon and armor
        if (this.hasMixin(Game.EntityMixins.Equipper)) {
            if (this.getWeapon()) {
                modifier += this.getWeapon().getAttackValue();
            }
        }
        return this._attackValue + modifier;
    },
    getAccuracyValue: function() {
        var modifier = 0;
        // If we can equip items, then have to take into consideration weapon and armor
        //for player, accuracy = 100 * 1.065^(weapon net enchant)
        //Net enchantment bonus = (Excess strength) * 0.25 + (Enchant level)
        //Damage = (Regular damage) * 1.065 ^ Enchant
        if (this.hasMixin(Game.EntityMixins.Equipper)) {
            if (this.getWeapon()) {
                modifier = 0;
            }
        }
        return this._accuracyValue + modifier;
    },
    attack: function(target) {
        // If the target is destructible, calculate the damage based on attack and defense value
        if (target.hasMixin('Destructible')) {
            var accuracy = this.getAccuracyValue();
            var attack = this.getAttackValue();
            var defense = target.getDefenseValue();
            if (target.hasMixin(Game.EntityMixins.PlayerActor)) {
                defense = defense * 10;
            }
            var hitProbability = accuracy * Math.pow(0.987, defense);
            console.log("def:" + defense);
            console.log("hitprob: " + hitProbability);
            if (Math.random()*100 < hitProbability){
                var max = Math.max(0, attack);
                var damage = 1 + Math.floor(Math.random() * max);

                Game.sendMessage(this, 'You strike the %s for %d damage!', [target.getName(), damage]);
                Game.sendMessage(target, 'The %s strikes you for %d damage!',  [this.getName(), damage]);

                target.takeDamage(this, damage);
            } else {
                Game.sendMessage(this, 'You miss the %s!', [target.getName()]);
                Game.sendMessage(target, 'The %s misses you!',  [this.getName()]);
            }
        }
    }
}

Game.EntityMixins.Thrower = {
    name: 'Thrower',
    groupName: 'Thrower',
    init: function(template) {
        this._throwDistance = template['throwDistance'] || 24;
    },
    throwItem: function(item, x, y, key) {
        var startPointX= this.getX();
        var startPointY = this.getY()
        var endPointX = x;
        var endPointY = y;

        var points = Game.Geometry.getLine(startPointX, startPointY, endPointX, endPointY);
        for (var index in points){
            if (this._map.getTile(points[index].x, points[index].y) == Game.Tile.wallTile){
                break;
            }            
            endPointX = points[index].x;
            endPointY = points[index].y;
        }
   
        var creatureReference = this.getMap().getEntityAt(x, y);
        if (creatureReference !== undefined){
            this.throwAttack(item, creatureReference);
        } else{
            Game.sendMessage(this, 'You throw a %s!',item.getName());
        }

        if (item.hasMixin(Game.ItemMixins.Edible)) {
            if(item._name === "shatter potion"){
                this._map.shatter(endPointX, endPointY);
            }
        }

        if (this.hasMixin(Game.EntityMixins.Equipper)) {
            this.removeItem(key);
        }
        if (!item.hasMixin(Game.ItemMixins.Edible)) {
            this._map.addItem(endPointX, endPointY, item);
        }
    },
    throwAttack: function(item, target) {
        var amount = Math.max(0, item.getThrownAttackValue() - target.getDefenseValue());
        amount = Math.floor((Math.random() * amount));
        Game.sendMessage(this, 'throw a %s at the %s for %d damage', [item.getName(),target.getName(), amount]);
        target.takeDamage(this, amount);
        if(item._potionEffect !== null){
            console.log("setting potion effect:" + item._potionEffect);
            target.setEffect(item._potionEffect);
        }   
    }
}

Game.EntityMixins.MessageRecipient = {
    name: 'MessageRecipient',
    init: function(template) {
        this._messages = [];
    },
    receiveMessage: function(message) {
        this._messages.unshift(message);
    },
    getMessages: function() {
        return this._messages;
    },
    clearMessages: function() {
        var totalMessages = this._messages.length;
        if(length > 40){
            this._messages = this._messages.slice(0, totalMessages.length - 1);
        } 
    }
}

// This signifies our entity posseses a field of vision of a given radius.
Game.EntityMixins.Sight = {
    name: 'Sight',
    groupName: 'Sight',
    init: function(template) {
        this._sightRadius = template['sightRadius'] || 5;
    },
    getSightRadius: function() {
        return this._sightRadius;
    },
    canSee: function(entity) {
        // If not on the same map or on different floors, then exit early
        if (!entity || this._map !== entity.getMap()) {
            return false;
        }

        var otherX = entity.getX();
        var otherY = entity.getY();

        // If we're not in a square field of view, then we won't be in a real
        // field of view either.
        if ((otherX - this._x) * (otherX - this._x) +
            (otherY - this._y) * (otherY - this._y) >
            this._sightRadius * this._sightRadius) {
                return false;
        }

        // Compute the FOV and check if the coordinates are in there.
        var found = false;
        this.getMap().getFov().compute(
            this.getX(), this.getY(), 
            this.getSightRadius(), 
            function(x, y, radius, visibility) {
                if (x === otherX && y === otherY) {
                    found = true;
                }
            });
        return found;
    }
}

//Inventory Holder
Game.EntityMixins.InventoryHolder = {
    name: 'InventoryHolder',
    init: function(template) {
        // Default to 10 inventory slots.
        var inventorySlots = template['inventorySlots'] || 10;
        // Set up an empty inventory.
        this._items = new Array(inventorySlots);
    },
    getItems: function() {
        return this._items;
    },
    getItem: function(i) {
        return this._items[i];
    },
    addItem: function(item) {
        // Try to find a slot, returning true only if we could add the item.
        for (var i = 0; i < this._items.length; i++) {
            if (!this._items[i]) {
                this._items[i] = item;
                return true;
            }
        }
        return false;
    },
    removeItem: function(i) {
        // If we can equip items, then make sure we unequip the item we are removing.
        if (this._items[i] && this.hasMixin(Game.EntityMixins.Equipper)) {
            this.unequip(this._items[i]);
        }
        // Simply clear the inventory slot.
        this._items[i] = null;
    },
    canAddItem: function() {
        // Check if we have an empty slot.
        for (var i = 0; i < this._items.length; i++) {
            if (!this._items[i]) {
                return true;
            }
        }
        return false;
    },
    pickupItems: function(indices) {
        // Allows the user to pick up items from the map, where indices is
        // the indices for the array returned by map.getItemsAt
        var mapItems = this._map.getItemsAt(this.getX(), this.getY());
        var added = 0;
        // Iterate through all indices.
        for (var i = 0; i < indices.length; i++) {
            // Try to add the item. If our inventory is not full, then splice the 
            // item out of the list of items. In order to fetch the right item, we
            // have to offset the number of items already added.
            if (this.addItem(mapItems[indices[i]  - added])) {
                mapItems.splice(indices[i] - added, 1);
                added++;
            } else {
                // Inventory is full
                break;
            }
        }
        // Update the map items
        this._map.setItemsAt(this.getX(), this.getY(), mapItems);
        // Return true only if we added all items
        return added === indices.length;
    },
    dropItem: function(i) {
        // Drops an item to the current map tile
        if (this._items[i]) {
            if (this._map) {
                this._map.addItem(this.getX(), this.getY(), this._items[i]);
            }
            this.removeItem(i);      
        }
    }
};

Game.EntityMixins.Bleeder = {
    name: 'Bleeder',
    init: function(template) {
        // Number of points to decrease fullness by every turn.
        this._bleedRate = template['bleedRate'] || 1;
    },
    addTurnBleed: function() {
        // Remove the standard depletion points
        if (this._head === null){
            this.modifyHPBy(-this._bleedRate);
            this.getMap().changeTile(this.getX(),this.getY(), Game.Tile.bloodTile);
        }
        
    },
    modifyHPBy: function(points) {
        this._hp = this._hp + points;
        if (this._hp <= 0) {
            this._hp = 0;
            if (this.hasMixin(Game.EntityMixins.PlayerActor)) {
                this.act();
            } else {
                this.getMap().removeEntity(this);
            }
        } else if (this._hp > this._maxHp) {
            this._hp = this._maxHp;
        }
    },
    getHeadIndex: function(){
        for (var i = 0; i < this._items.length; i++) {
            if (this._items[i]) {
                // Check if the item is worn as a head
                if (this._items[i] === this.getHead()) {
                    return i;
                }
            }
        }
    }
};

Game.EntityMixins.HeadDropper = {
    name: 'HeadDropper',
    init: function(template) {
        this._headDropRate = 100;
        this._headHits = template["headHits"] || 1;
    },
    tryDropHead: function() {
        if (Math.round(Math.random() * 100) < this._headDropRate) {
            // Create a new head item and drop it.
            this._map.addItem(this.getX(), this.getY(),
                Game.ItemRepository.create('head', {
                    name: this._name + ' head',
                    foreground: this._foreground,
                    headHits: this._headHits
                }));
        }
    }
};

Game.EntityMixins.Equipper = {
    name: 'Equipper',
    init: function(template) {
        this._weapon = null;
        this._armor = null;
        this._head = null;
    },
    wield: function(item) {
        this._weapon = item;
    },
    unwield: function() {
        this._weapon = null;
    },
    wear: function(item) {
        this._armor = item;
    },
    unwear: function() {
        this._armor = null;
    },
    wearHead: function(item){
        this._head = item;
    },
    unhead: function(){
        this._head = null;
    },
    getWeapon: function() {
        return this._weapon;
    },
    getArmor: function() {
        return this._armor;
    },
    getHead: function() {
        return this._head;
    },
    unequip: function(item) {
        // Helper function to be called before getting rid of an item.
        if (this._weapon === item) {
            this.unwield();
        }
        if (this._armor === item) {
            this.unwear();
        }
        if (this._head === item) {
            this.unhead();
        }
    }
};

Game.EntityMixins.Affectible = {
    name: 'Affectible',
    init: function(template){
        this._effects = [];
    },
    getEffects: function(){
        return this._effects;
    },
    handleEffects: function(){
        var effects = this._effects;
        var stopActor = 0;
        for (var i = 0; i < effects.length; i++){
            if (!effects[i].isDone()){
                stopActor = this.applyEffect(effects[i].getName());
                effects[i].update();
                if (stopActor === 1) {return 1};
            } else {
                this.removeEffect(i)
            }
        }
        return 0;
    },
    applyEffect: function(effectName) {
        if (effectName === "poisoned" && this.hasMixin('Destructible')){
            return this.takeDamage(this, 1);
        }
    },
    setEffect : function(effect) {
        this._effects.push(effect);
    },
    removeEffect: function(index) {
        this._effects.splice(index,1);
    }
}

Game.sendMessage = function(recipient, message, args) {
    // Make sure the recipient can receive the message 
    // before doing any work.
    if (recipient.hasMixin(Game.EntityMixins.MessageRecipient)) {
        // If args were passed, then we format the message, else
        // no formatting is necessary
        if (args) {
            message = vsprintf(message, args);
        }
        recipient.receiveMessage(message);
    }
}

Game.sendMessageNearby = function(map, centerX, centerY, message, args) {
    // If args were passed, then we format the message, else
    // no formatting is necessary
    if (args) {
        message = vsprintf(message, args);
    }
    // Get the nearby entities
    entities = map.getEntitiesWithinRadius(centerX, centerY, 5);
    // Iterate through nearby entities, sending the message if
    // they can receive it.
    for (var i = 0; i < entities.length; i++) {
        if (entities[i].hasMixin(Game.EntityMixins.MessageRecipient)) {
            entities[i].receiveMessage(message);
        }
    }
}