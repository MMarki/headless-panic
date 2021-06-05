Game.EntityMixins = {};

Game.EntityMixins.PlayerActor = {
    name: 'PlayerActor',
    groupName: 'Actor',
    init: function(template) {
        // Load tasks
        this._pathingTarget = null;
        this._hasNotMovedThisTurn = true;
        this.murderer = '';
    },
    act: function() {
        if (this._acting) {
            return;
        }
        this._acting = true;
        this.addTurnBleed();
        this.handleEffects();
        this.applyNewEffects();
        this.checkHeadRot();
        // Detect if the game is over
        if (this.getHP() < 1) {
            Game.Screen.playScreen.setGameEnded(true);
            // Send a last message to the player
            Game.sendMessage(this, '%c{#F61067}You have died... Press %c{yellow}[Enter] %c{#F61067}to continue!');
        }
        // Re-render the screen
        Game.refresh();
        // Lock the engine and wait asynchronously
        // for the player to press a key.
        this.getMap().getEngine().lock();  
        // Clear the message queue
        this.clearMessages();
        this._acting = false; 
    },
    getPathingTarget: function(){
        return this._pathingTarget;
    },
    setPathingTarget: function(newPath){
        this._pathingTarget = newPath;
    },
    checkHeadRot: function(){
        let myHead = this.getHead();
        if (myHead !== null && myHead._name === 'zombie head'){
            if (Math.random()*100 < 2){
                let headIndex = this.getHeadIndex();
                this.unhead();
                this.removeItem(headIndex);
                Game.sendMessage(this, "%c{#F61067}Your zombie head rots off!");
            }
        }
    }
        
}

Game.EntityMixins.TaskActor = {
    name: 'TaskActor',
    groupName: 'Actor',
    init: function(template) {
        // Load tasks
        this._tasks = template['tasks'] || ['wander'];
        this._hunting = false;
        this._castWaitMax = template['castWaitMax'] || 5;
        this._castWait = this._castWaitMax;
    },
    act: function() {
        if (this.hasMixin('Affectible')){
            let stopActor = this.handleEffects();
            if (stopActor === 1) {return;}
            this.applyNewEffects();
        }

        if (this.hasMixin('Summoner') && this._summonWait > 0) {
            this._summonWait -=1;
        }

        if (this._castWait !== undefined && this._castWait > 0){
            this._castWait -=1;
        }

        // Iterate through all our tasks
        for (let task of this._tasks) {
            if (this.canDoTask(task)) {
                // If we can perform the task, execute the function for it.
                this[task]();
                return;
            }
        }
    },
    canDoTask: function(task) {
        this._hunting = false;
        if (task === 'summonMonster') {
            return this._summonWait === 0;     
        } else if (task === 'castRune') {   
            let player = this.getMap().getPlayer()
            return this.hasMixin('Sight') && this.canSee(player) && this._castWait === 0;
        } else if (task === 'charge') {
            let player = this.getMap().getPlayer()
            return (this.hasMixin('Sight') && this.canSee(player)) || this.getChargeDirection() !=='none';
        } else if (task === 'aimRange') {
            let player = this.getMap().getPlayer();
            return this.hasMixin('Sight') && this.canSee(player) && this._castWait === 0;
        }else if (task === 'rangeAttack') {
            let player = this.getMap().getPlayer();
            return this.hasMixin('Sight') && this.canSee(player) && this._aiming;
        }else if (task === 'hunt' || task === 'hopHunt') {
            let player = this.getMap().getPlayer()
            return (this.hasMixin('Sight') && this.canSee(player) 
            && !(this._name === 'rat' && player._ratThreaten === true) 
            && !(this._name === 'wraith' && player._hasNotMovedThisTurn === true))
            || (this._name === 'death');
        } else if (task === 'wander' || task ==='hopWander') {
            return true;
        } else {
            throw new Error('Tried to perform undefined task ' + task);
        }
    },
    hunt: function() {
        var player = this.getMap().getPlayer();
        this._hunting = true;

        // If we are adjacent to the player, then attack instead of hunting.
        var offsets = Math.abs(player.getX() - this.getX()) + 
            Math.abs(player.getY() - this.getY());
        if (offsets === 1) {
            if (this.hasMixin('Attacker')) {
                this.attack(player);
                return;
            } else {
                if (this.hasMixin('Exploder')) {
                    var currentPosition = {x: this.getX(), y: this.getY()}
                    var tempList = []
                    tempList.push(currentPosition)
                    var map = this.getMap();
                    map.gasGrow(tempList, this._explodeTile, this._explodeSize);
                    map.removeEntity(this);
                    Game.sendMessage(player, "The " + this._name + " explodes into a pool of poison!");  
                }
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
        // Once we've gotten the path, we want to move to the second cell that is passed in the callback (the first is the entity's starting point)
        var count = 0;
        path.compute(source.getX(), source.getY(), function(x, y) {
            if (count == 1) {
                source.tryMove(x, y);
            }
            count++;
        });
    },
    hopHunt: function() {
        let player = this.getMap().getPlayer();
        this._hunting = true;
        let moveSuccess = false;

        // If we are adjacent to the player, then attack instead of hunting.
        let xOffset = player.getX() - this.getX();
        let yOffset = player.getY() - this.getY();
        let totalOffset = Math.abs(xOffset) + Math.abs(yOffset);

        //hopping direction
        if (Math.abs(xOffset) > Math.abs(yOffset)){
            if (xOffset > 0 && !moveSuccess) {
                moveSuccess = this.hopMove(totalOffset, 1, 0);
            }
            if (xOffset < 0 && !moveSuccess) {
                moveSuccess = this.hopMove(totalOffset, -1, 0);
            }
            if (yOffset > 0 && !moveSuccess) {
                moveSuccess = this.hopMove(totalOffset, 0, 1);
            }
            if (yOffset < 0 && !moveSuccess) {
                moveSuccess = this.hopMove(totalOffset, 0, -1);
            } 
        } else {
            if (yOffset > 0 && !moveSuccess) {
                moveSuccess = this.hopMove(totalOffset, 0, 1);
            }
            if (yOffset < 0 && !moveSuccess) {
                moveSuccess = this.hopMove(totalOffset, 0, -1);
            } 
            if (xOffset > 0 && !moveSuccess) {
                moveSuccess = this.hopMove(totalOffset, 1, 0);
            }
            if (xOffset < 0 && !moveSuccess) {
                moveSuccess = this.hopMove(totalOffset, -1, 0);
            }
        }
    },
    hopMove: function(totalOffset, xDir, yDir) {
        let player = this.getMap().getPlayer();
        if (totalOffset === 1) {
            if (this.hasMixin('Attacker')) {
                this.attack(player);
                return true;
            }
        } else {
            moveSuccess =  this.tryMove(this.getX() + xDir, this.getY() + yDir);
            if (moveSuccess){
                this.tryMove(this.getX() + xDir, this.getY() + yDir);
            }
            return moveSuccess;
        }  
    },
    aimRange: function() {
        this._aiming = true;
        let player = this.getMap().getPlayer();
        this._aimX = player.getX();
        this._aimY = player.getY();

        this._castWait = this._castWaitMax;

    },
    rangeAttack: function() {
        player = this.getMap().getPlayer();
        this._aiming = false;

        let castString = this.getName() === 'imp' ? 'casts magic dart' : (this.getName() === 'hydra' ? 'spits water' : 'breathes fire');

        const entity =this._map.getEntityAt(this._aimX, this._aimY);
        if (entity){
            let target = entity;
            let defense = target.getDefenseValue();
            if (target.hasMixin('PlayerActor')) {
                defense = defense * 10;
            }
            let hitProbability = 90 * Math.pow(0.988, defense);

            if (Math.random()*100 < hitProbability){
                let amount = 4;
                if (amount > 0){
                    let returnMessage = target.takeDamage(this, amount, true);
                    if (returnMessage.length > 0){
                        Game.sendMessage(target, 'The %s ' + castString + ' for %d damage!' + returnMessage, [this.getName(), amount]);
                    } else {
                        Game.sendMessage(target, 'The %s ' + castString + ' for %d damage!', [this.getName(), amount]);
                    }
                }
            } else {
                Game.sendMessage(target, 'The %s ' + castString + '. It misses.', [this.getName()]);
            }
        } else {
            Game.sendMessage(player, 'The %s ' + castString + '. It misses.', [this.getName()]);
        }

        if (this.getName() === 'hydra'){
            let list = [];
            list.push ({x: this._aimX, y: this._aimY});
            this._map.cellGrow(list, Game.Tile.shallowWaterTile, 5, false);
        } else if (this.getName() === 'underwyrm'){
            let points = Game.Geometry.getLine(this.getX(), this.getY(), this._aimX, this._aimY);

            // For each cell on line
            for (let i = 0, l = points.length; i < l; i++) {
                let list = [];
                list.push ({x: points[i].x, y: points[i].y});
                this._map.cellGrow(list, 'fireTile', 1, true);
            }
        }
    },
    charge: function() {
        let player = this.getMap().getPlayer();
        this._hunting = true;

        let xOffset = player.getX() - this.getX();
        let yOffset = player.getY() - this.getY();
        let chargeDirection = this.getChargeDirection();

        if (chargeDirection === 'none'){
            if (xOffset === 0) {
                // charge vertically (up or down)
                if (yOffset > 0) {
                    this.setChargeDirection('down');
                    Game.sendMessage(player, "The " + this.getName() + " is charging!");
                } else {
                    this.setChargeDirection('up');
                    Game.sendMessage(player, "The " + this.getName() + " is charging!");
                }
            } else if (yOffset === 0){
                if (xOffset > 0) {
                    this.setChargeDirection('right');
                    Game.sendMessage(player, "The " + this.getName() + " is charging!");
                } else {
                    this.setChargeDirection('left');
                    Game.sendMessage(player, "The " + this.getName() + " is charging!");
                }
            }
        }

        let moveSuccess = true;
        let hasMoved = false;
        
        if (chargeDirection === 'up') {
            moveSuccess = this.tryMove(this.getX(), this.getY() - 1);
            hasMoved = true;
        } else if (chargeDirection === 'down') {
            moveSuccess = this.tryMove(this.getX(), this.getY() + 1);
            hasMoved = true;
        } else if (chargeDirection === 'left') {
            moveSuccess = this.tryMove(this.getX() - 1, this.getY());
            hasMoved = true;
        } else if (chargeDirection === 'right'){
            moveSuccess = this.tryMove(this.getX() + 1, this.getY());
            hasMoved = true;
        }

        if (!moveSuccess){
            this.setChargeDirection('none');
        };

        if (!hasMoved){
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
            // Once we've gotten the path, we want to move to the second cell that is passed in the callback (the first is the entity's starting point)
            var count = 0;
            path.compute(source.getX(), source.getY(), function(x, y) {
                if (count == 1) {
                    source.tryMove(x, y);
                }
                count++;
            });
        }
    },
    hopWander: function() {
        // Flip coin to determine if moving by 1 in the positive or negative direction
        let i = 0;
        while(i < 10){
            let xOffset = 0;
            let yOffset = 0;
            let moveOffset = (Math.round(Math.random()) === 1) ? 1 : -1;
            let map = this.getMap();

            // Flip coin to determine if moving in x direction or y direction
            if (Math.round(Math.random()) === 1) {
                xOffset = moveOffset;
            } else {
                yOffset = moveOffset;
            }
            
            //don't walk into fire while wandering, unless you're already on fire, then you do you, girl
            let alreadyStandingOnFire = map.isFireTile(this.getX(), this.getY());

            if (map.getTile(this.getX() + xOffset, this.getY() + yOffset).isWalkable() 
            && ( alreadyStandingOnFire || (!alreadyStandingOnFire && !map.isFireTile(this.getX() + xOffset, this.getY() + yOffset)) )
            ){
                let moveSuccess =  this.tryMove(this.getX() + xOffset, this.getY() + yOffset);
                if (moveSuccess){
                    this.tryMove(this.getX() + xOffset, this.getY() + yOffset);
                }

                break;
            }
            i++;
        }
    },
    wander: function() {
       if (this._aiming) {
           //clear out aiming if a player ducks out of sight
           this._aiming = false;
       }
        // Flip coin to determine if moving by 1 in the positive or negative direction
        let i = 0;
        while(i < 10){
            let xOffset = 0;
            let yOffset = 0;
            let moveOffset = (Math.round(Math.random()) === 1) ? 1 : -1;
            let map = this.getMap();

            // Flip coin to determine if moving in x direction or y direction
            if (Math.round(Math.random()) === 1) {
                xOffset = moveOffset;
            } else {
                yOffset = moveOffset;
            }
            
            //don't walk into fire while wandering, unless you're already on fire, then you do you, girl
            let alreadyStandingOnFire = map.isFireTile(this.getX(), this.getY());

            if (map.getTile(this.getX() + xOffset, this.getY() + yOffset).isWalkable() 
            && ( alreadyStandingOnFire || (!alreadyStandingOnFire && !map.isFireTile(this.getX() + xOffset, this.getY() + yOffset)) || this.hasMixin('Fireproof') )
            ){
                this.tryMove(this.getX() + xOffset, this.getY() + yOffset);
                break;
            }
            i++;
        }
    },
    summonMonster: function(){
        this.summon();
    },
    castRune: function(){
        let map = this.getMap();
        let player = map.getPlayer();
        let x = 0;
        let y = 0;
        let i = 0;
        while(i < 10){
            const xOffset = Math.random() > .5 ? -1 : 1;
            const yOffset = Math.random() > .5 ? -1 : 1;

            x = player.getX() + xOffset;
            y = player.getY() + yOffset;

            if (map._tiles[x][y].isWalkable() && x >= 0 && x < map._width && y >= 0 && y < map._height){
                break;
            }
            i++;
        }     

        if (map._tiles[x][y].isWalkable()){
            map.setDynamicTilePosition('vulnerabilityTile', x, y);
            Game.sendMessage(player, "%c{#F61067}The " + this._name + " casts a spell!");
            this._castWait = this._castWaitMax;
        }
    }
};

Game.EntityMixins.Destructible = {
    name: 'Destructible',
    init: function(template) {
        this._maxHP = template['maxHP'] || 10;
        // We allow taking in health from the template in case we want the entity to start with a different amount of HP than the  max specified.
        this._hp = template['hp'] || this._maxHP;
        this._defenseValue = template['defenseValue'] || 0;
        this._vulnerabilities = template['vulnerabilities'] || [];
        this._resistances = template['resistances'] || [];
    },
    getHP: function() {
        return this._hp;
    },
    getMaxHP: function() {
        return this._maxHP;
    },
    modifyMaxHPBy: function(amount) {
        this._maxHP += amount;
    },
    getVulnerabilities: function() {
        return this._vulnerabilities;
    },
    getResistances: function() {
        return this._resistances;
    },
    getDefenseValue: function() {
        let modifier = 0;
        let strengthModifier = 0;
        let headIsToad = false;
        const isProtected =  this.hasMixin('Affectible') ? this.hasEffect('protected') : false;
        const isVulnerable = this.hasMixin('Affectible') ? this.hasEffect('vulnerable') : false;
        // If we can equip items, then have to take into 
        // consideration weapon and armor
        if (this.hasMixin('Equipper')) {
            let strengthGap = 0;
            let armor = this.getArmor()
            if (armor !== null) {
                strengthGap = this.getStrengthValue() - armor._strengthRequirement;
                if (strengthGap <  0){
                    //stengthModifier will be negative, and large if you're not strong enough to wear the armor
                    strengthModifier = Math.floor(4.5 * strengthGap);
                } else if (strengthGap > 0){
                    strengthModifier =  strengthGap;
                }
                modifier = (armor.getDefenseValue() + strengthModifier);
            }
            
            if (this._toady){
                headIsToad = true;
            }
        }
        
        if (this.hasMixin('Hopper') || headIsToad) {
            let tile = this._map.getTile(this._x, this._y);
            if (tile._isWater){
                modifier += 1;
            }
        } 
        if (isProtected) {
            modifier +=3;
        }
        if (isVulnerable) {
            modifier -=3;
        }
        return Math.max(this._defenseValue + modifier + (this._armored ? 1: 0), 0);
    },
    modifyHPBy: function(points) {
        this._hp = this._hp + points;
        if (this._hp <= 0) {
            this._hp = 0;
            if (this.hasMixin('PlayerActor')) {
                this.murderer = 'bleeding out';
                this.act();
            } else {
                this.getMap().removeEntity(this);
            }
        } else if (this._hp > this._maxHP) {
            this._hp = this._maxHP;
        }
    },
    takeDamage: function(attacker, damage, isKnockDamage) {
        let returnMessage = '';

        if (this._vengeful === true){
            if( attacker.takeDamage !== undefined){
                attacker.takeDamage(this, Math.ceil(damage/2), true);
            } 
        }

        if (this.hasMixin('Bleeder')){
            let myHead = this.getHead();
            if (myHead !== null && isKnockDamage) {
                if (myHead._headHits > 1) {
                    myHead._headHits -= 1;
                } else {
                    //drop the item that is equipped on the head of the player
                    var headIndex = this.getHeadIndex();
                    this.unhead();
                    this.removeItem(headIndex);
                    returnMessage = " %%c{#F61067}Your head falls off!";
                    //Game.sendMessage(this, "%c{#F61067}Your head falls off!");
                    return returnMessage;
                }
            } else {
                this._hp -= damage;
            }
        } else {
            this._hp -= damage;
            if( this._hp > 0 && this.hasMixin('Summoner') && this._splitOnHit === 1 && this._summonWait === 0) {
                var creature = this.summon('slime');
                if (creature !== null){
                    creature._hp = Math.ceil(this._hp/2);
                    if (this.hasMixin("Affectible")){
                        creature.transferEffects(this._effects); 
                    }   
                }
                this._hp = Math.ceil(this._hp/2);
            }
            if( this._hp > 0 && this.hasMixin('MultiHeaded')){
                if (this._hp < this._headsBreakpoints[this._headsBreakpoints.length - 1]){
                    if (this._headsRemaining === this._heads) {
                        this._headsRemaining--;
                        this.tryDropHead();
                        //console.log("first drop!: ", this._hp);
                    }
                } if (this._hp < this._headsBreakpoints[this._headsBreakpoints.length - 2]){
                    if (this._headsRemaining === this._heads - 1) {
                        this._headsRemaining--;
                        this.tryDropHead();
                        //console.log("second drop!: ", this._hp);
                    }
                } if (this._hp < this._headsBreakpoints[this._headsBreakpoints.length - 3]){
                    if (this._headsRemaining === this._heads - 2) {
                        this._headsRemaining--;
                        this.tryDropHead();
                        //console.log("third drop!: ", this._hp);
                    }
                } if (this._hp < this._headsBreakpoints[this._headsBreakpoints.length - 4]){
                    if (this._headsRemaining === this._heads - 3) {
                        this._headsRemaining--;
                        this.tryDropHead();
                        //console.log("fourth drop!: ", this._hp);
                    }
                }
            } 
        }
        
        // If have 0 or less HP, then remove ourseles from the map
        if (this._hp <= 0) {
            this._hp = 0;
            if (this._isThrowTarget){
                Game.Screen.playScreen._lastTarget = null;
            }

            if (!this.isNotMonster()){
                returnMessage = ' %%c{#61AEEE}You kill ' + this.describeThe(false) + '.';       
            } else {
                returnMessage = ' You break the ' + this.getName() + '.';
            }
            
            if (this.hasMixin('KeyDropper')) {
                this.dropKey();
            }
            if (this.hasMixin('HeadDropper')) {
                this.tryDropHead();
            }
            if (this.hasMixin('Exploder')) {
                var currentPosition = {x: this.getX(), y: this.getY()}
                var tempList = []
                tempList.push(currentPosition)
                if (!this.isNotMonster()) {
                    this.getMap().gasGrow(tempList, this._explodeTile, this._explodeSize);
                } else {
                    this.getMap().cellGrow(tempList, this._explodeTile, this._explodeSize, true);
                }
            }
            if (this.hasMixin('PlayerActor')) {
                this.act();
                this.murderer = attacker.describeA === undefined ? attacker : attacker.describeA();
            } else {
                this.getMap().removeEntity(this);
            }
            return returnMessage;
        }
        return '';
    }
}

let pushFunction = function(target){
    targetPosition = '';
    const targetX = target.getX();
    const targetY = target.getY();
    const thisX = this.getX();
    const thisY = this.getY();

    const xOffset = (targetX - thisX);
    const yOffset = (targetY - thisY);

    if (xOffset < 0){
        target.tryMove(targetX - 1, targetY)
    }
    if (xOffset > 0){
        target.tryMove(targetX + 1, targetY)
    }
    if (yOffset < 0){
        target.tryMove(targetX, targetY - 1)
    }
    if (yOffset > 0){
        target.tryMove(targetX, targetY + 1)
    }
}

Game.EntityMixins.Attacker = {
    name: 'Attacker',
    groupName: 'Attacker',
    init: function(template) {
        this._attackValue = template['attackValue'] || 1;
        this._accuracyValue = template['accuracyValue'] || 70;
        this._strengthValue = template['strengthValue'] || 1;
    },
    getAttackValue: function() {
        var modifier = 0;
        // If we can equip items, then have to take into 
        // consideration weapon and armor
        if (this.hasMixin('Equipper')) {
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
        if (this.hasMixin('Equipper')) {
            if (this.getWeapon()) {
                modifier = 0;
            }
        }
        return this._accuracyValue + modifier;
    },
    attack: function(target) {
        // If the target is destructible, calculate the damage based on attack and defense value
        if (target.hasMixin('Destructible')) {
            let accuracy = this.getAccuracyValue();
            let attack = this.getAttackValue();
            let defense = target.getDefenseValue();
            let strengthModifier = 0;
            let strengthGap = 0;
            let damageType = 'crush';
            let targetIsVulnerable = false;
            let targetIsResistant = false;
            if (target.hasMixin('PlayerActor')) {
                defense = defense * 10;
            }

            if (this.hasMixin('Equipper')){
                if (this.getWeapon() !== null){
                    strengthGap = this.getStrengthValue() - this.getWeapon()._strengthRequirement
                    if (strengthGap <  0){
                        strengthModifier = 4 * strengthGap;
                    } else if (strengthGap > 0){
                        strengthModifier =  strengthGap;
                    }
                    damageType = this.getWeapon().getDamageType();
                } else {
                    strengthModifier = this.getStrengthValue();
                }
            }

            targetIsVulnerable = target.getVulnerabilities().includes(damageType);
            targetIsResistant = target.getResistances().includes(damageType);

            let hitProbability = Math.max(0,accuracy * Math.pow(0.988, defense) + strengthModifier*4);
           
            //console.log("def:" + defense);
            //console.log("StrengthMod:" + strengthModifier);
            //console.log("hitprob: " + hitProbability);
            if (Math.random()*100 < hitProbability){
                let max = Math.max(1, attack + (strengthModifier));
                let damage = max;
                if (targetIsVulnerable) {
                    damage *= 2;
                } else if (targetIsResistant) {
                    damage = Math.ceil(damage/2);
                } 

                let returnMessage = target.takeDamage(this, damage, true);
                if (returnMessage.length > 0){
                    Game.sendMessage(this, 'You strike %s for %d damage.' + returnMessage, [target.describeThe(false), damage]);
                    Game.sendMessage(target, '%s strikes you for %d damage.' + returnMessage,  [this.describeThe(true), damage]);
                } else {
                    Game.sendMessage(this, 'You strike %s for %d damage.', [target.describeThe(false), damage]);
                    Game.sendMessage(target, '%s strikes you for %d damage.',  [this.describeThe(true), damage]);
                }
               
                if (this.hasMixin('Poisoner') && target.hasMixin('Affectible')){
                    let newEffect = new Game.Effect(Math.floor(damage*1.5), 'poisoned');
                    target.setEffect(newEffect);
                }
                if (this.hasMixin('Blinder') && target.hasMixin('Affectible')){
                    let newEffect = new Game.Effect(Math.floor(damage*1.5), 'blind');
                    target.setEffect(newEffect);
                }
                if (this.hasMixin('Burner') && target.hasMixin('Affectible')){
                    let newEffect = new Game.Effect(Math.floor(damage*1.5), 'burning');
                    target.setEffect(newEffect);
                }
                if (this.hasMixin('Paralyzer') && target.hasMixin('Affectible')){
                    if (Math.random()*100 < 50){
                        let newEffect = new Game.Effect(Math.floor(damage*1.5), 'paralyzed');
                        target.setEffect(newEffect);
                    }
                }  
                if (this.hasMixin('Sucker') && target.hasMixin('Affectible')){
                    this.suck(Math.floor(damage/2));
                }
                if (this._sucker && target.hasMixin('Affectible')){
                    this.modifyHPBy(Math.floor(damage/2));
                }
                if (this.hasMixin('Pusher') && target.hasMixin('Affectible') && target.getHP() > 0){
                    this.pushEntity(target);
                } 
                if (this.hasMixin('Equipper') && target.hasMixin('Affectible')){
                    if (this._venomous){
                        if (Math.random()*100 < 50){
                            let newEffect = new Game.Effect(Math.floor(damage*1.5), 'poisoned');
                            target.setEffect(newEffect);
                        }
                    } else if (this._paralytic){
                        if (Math.random()*100 < 25){
                            let newEffect = new Game.Effect(Math.floor(damage), 'paralyzed');
                            target.setEffect(newEffect);
                        }
                    } else if (this._pusher && target.getHP() > 0){
                        if (Math.random()*100 < 50){
                            this.pushEntity(target);
                        }
                    } else if (this._burner && target.getHP() > 0){
                        if (Math.random()*100 < 50){
                            let newEffect = new Game.Effect(Math.floor(damage*1.5), 'burning');
                            target.setEffect(newEffect);
                        }
                    }
                } 
                if (this.hasMixin('Acidic') && target.hasMixin('Affectible')){
                    let armorIndex = target.getArmorIndex();
                    if (armorIndex !== null){
                        target.unwear();
                        target.removeItem(armorIndex);
                        Game.sendMessage(target, '%c{#F61067}Your armor dissolves!');
                    }
                } 
                if (target.hasMixin('Acidic') && this.hasMixin('PlayerActor')){
                    let weaponIndex = this.getWeaponIndex();
                    if (weaponIndex !== null){
                        this.unwield();
                        this.removeItem(weaponIndex);
                        Game.sendMessage(this, '%c{#F61067}Your weapon dissolves!');
                    }
                } 
            } else {
                Game.sendMessage(this, 'You miss %s.', [target.describeThe(false)]);
                Game.sendMessage(target, '%s misses you.',  [this.describeThe(true)]);
            }
        }
    },
    incrementStrength: function(){
        this._strengthValue += 1;
    },
    getStrengthValue: function(){
        let strengthened = false;
        if (this.hasMixin('Equipper')) {
            strengthened = this._strengthened;
        }
        return strengthened ? this._strengthValue + 1 : this._strengthValue;
    }
}

Game.EntityMixins.Poisoner = {
    name: 'Poisoner',
    groupName: 'Poisoner',
    init: function(template) {
        template;
    }
}

Game.EntityMixins.Blinder = {
    name: 'Blinder',
    groupName: 'Blinder',
    init: function(template) {
        template;
    }
}

Game.EntityMixins.Burner = {
    name: 'Burner',
    groupName: 'Burner',
    init: function(template) {
        template;
    }
}

Game.EntityMixins.Paralyzer = {
    name: 'Paralyzer',
    groupName: 'Paralyzer',
    init: function(template) {
        template;
    }
}

Game.EntityMixins.Hopper = {
    name: 'Hopper',
    groupName: 'Hopper',
    init: function(template) {
        template;
    }
}

Game.EntityMixins.Swimmer = {
    name: 'Swimmer',
    groupName: 'Swimmer',
    init: function(template) {
        template;
    }
}

Game.EntityMixins.Deflecter = {
    name: 'Deflecter',
    groupName: 'Deflecter',
    init: function(template) {
        template;
    }
}

Game.EntityMixins.MultiHeaded = {
    name: 'MultiHeaded',
    groupName: 'MultiHeaded',
    init: function(template) {
        this._heads = template['heads'] || 1;
        this._headsRemaining = this._heads;
        this._headsBreakpoints = [];
        let hpIncrement = this._maxHP/this._heads;
        for (let i = 0; i < this._heads; i++){
            this._headsBreakpoints.push(i * hpIncrement)
            //console.log(i*hpIncrement);
        }
    }
}

Game.EntityMixins.KeyDropper = {
    name: 'KeyDropper',
    groupName: 'KeyDropper',
    init: function(template) {
        template;
    },
    dropKey: function() {
        // Create a new key item and drop it.
        const coords = this._map.findFreeTile(this.getX(), this.getY());
        this._map.addItem(coords.x, coords.y, Game.ItemRepository.create('key'));
    }
}

Game.EntityMixins.Unpoisonable = {
    name: 'Unpoisonable',
    groupName: 'Unpoisonable',
    init: function(template) {
        template;
    }
}

Game.EntityMixins.Fireproof = {
    name: 'Fireproof',
    groupName: 'Fireproof',
    init: function(template) {
        template;
    }
}

Game.EntityMixins.Sucker = {
    name: 'Sucker',
    groupName: 'Sucker',
    init: function(template) {
        template;
    },
    suck: function(in_healAmount){
        this.modifyHPBy(in_healAmount)
    }
}

Game.EntityMixins.Pusher = {
    name: 'Pusher',
    groupName: 'Pusher',
    init: function(template) {
        template;
    },
    pushEntity: pushFunction
}

Game.EntityMixins.Acidic = {
    name: 'Acidic',
    groupName: 'Acidic',
    init: function(template) {
        template;
    }
}

Game.EntityMixins.Thrower = {
    name: 'Thrower',
    groupName: 'Thrower',
    init: function(template) {
        this._throwDistance = template['throwDistance'] || 24;
    },
    throwItem: function(item, x, y, key) {
        let startPointX= this.getX();
        let startPointY = this.getY()
        let endPointX = x;
        let endPointY = y;
        let throwDistance = 0;

        var points = Game.Geometry.getLine(startPointX, startPointY, endPointX, endPointY);
        for (let point of points){
            let tileType = this._map.getTile(point.x, point.y)
            if (tileType == Game.Tile.wallTile || tileType === Game.Tile.doorTile){
                //console.log("oi mate, we hit a wall!");
                this.handleThrowDrop(item, true, this._map, point.x, point.y)
                break;
            }            
            endPointX = point.x;
            endPointY = point.y;
            throwDistance += 1;
        }
   
        var creatureReference = this.getMap().getEntityAt(endPointX, endPointY);
        if (creatureReference !== undefined){
            this.throwAttack(item, creatureReference, throwDistance);
            this.handleThrowDrop(item, true, this._map, endPointX, endPointY)
        } else{
            Game.sendMessage(this, 'You throw a %s.',item.getName());
            this.handleThrowDrop(item, false, this._map, endPointX, endPointY)
        }

        // potion effects
        if (item.hasMixin(Game.ItemMixins.Edible)) {
            if (item._name === "shatter potion"){
                this._map.shatter(endPointX, endPointY);
                Game.sendMessage(this, 'The %s creates a shockwave!',item.getName());
            } else if (item._name === "poison potion"){
                var tempList = []
                tempList.push({x: endPointX, y: endPointY});
                this._map.gasGrow(tempList, 'poisonTile', 12);
            } else if (item._name === "fire potion"){
                var tempList = []
                tempList.push({x: endPointX, y: endPointY});
                this._map.cellGrow(tempList, 'fireTile', 10, true);
            } else if (item._name === "darkness potion"){
                var tempList = []
                tempList.push({x: endPointX, y: endPointY});
                this._map.gasGrow(tempList, 'darknessTile', 10);
            }
        }

        if (this.hasMixin('Equipper')) {
            if (item.hasMixin('Throwable') && item.getStackQuantity() > 1){
                item.setStackQuantity(item.getStackQuantity() - 1);
                if (item.setStackQuantity === 0){
                    this.removeItem(key);
                }
            } else {
                this.removeItem(key);
            }
        }
    },
    isItemBrokenByThrow: function(item, hitMonster){
        if (item.hasMixin(Game.ItemMixins.Edible)) {
            return true;
        } else if (Math.random()*100 < item._throwBreakChance && hitMonster){
            return true
        }
        return false;
    },
    handleThrowDrop: function(item, hitMonster, mapRef, dropX, dropY){
        if (!this.isItemBrokenByThrow(item, hitMonster)){
            const coords = mapRef.findFreeTile(dropX, dropY);
            if (item.hasMixin("Usable") || item.isHeadible()){
                mapRef.addItem(coords.x, coords.y, item);
            } else {
                let droppedItem = Game.ItemRepository.create(item.getName());
                mapRef.addItem(coords.x, coords.y, droppedItem);
            }
        }
    },
    shoot: function(item, x, y, key){
        let startPointX= this.getX();
        let startPointY = this.getY()
        let endPointX = x;
        let endPointY = y;

        if (item._name === 'wand of blinking'){
            let points = Game.Geometry.getLine(startPointX, startPointY, endPointX, endPointY);
            for (let point of points){
                if (this.getMap().getTile(point.x, point.y) === Game.Tile.wallTile || this.getMap().getTile(point.x, point.y) === Game.Tile.doorTile || this.getMap().getEntityAt(point.x, point.y) && this.getMap().getEntityAt(point.x, point.y)._name !='chicken knight'){
                    //console.log("oi mate, we hit a wall!");
                    break;
                }            
                endPointX = point.x;
                endPointY = point.y;
            }
            this.setPosition(endPointX,endPointY);
            Game.Screen.playScreen.handleItemPickup()
            Game.Screen.playScreen.goDownStairs(); 
        }

        if (item._name === 'wand of fire' || item._name === 'wand of poison'){
            let points = Game.Geometry.getLine(startPointX, startPointY, endPointX, endPointY);
            for (let point of points){
                if (this.getMap().getTile(point.x, point.y) === Game.Tile.wallTile || this.getMap().getTile(point.x, point.y) === Game.Tile.doorTile){
                    //console.log("oi mate, we hit a wall!");
                    break;
                }            
                endPointX = point.x;
                endPointY = point.y;
            }
       
            let creatureReference = this.getMap().getEntityAt(endPointX, endPointY);
            if (creatureReference !== undefined){
                if (item._name === 'wand of poison'){
                    let newEffect = new Game.Effect(12, 'poisoned');
                    creatureReference.setEffect(newEffect);
                } else if (item._name === 'wand of fire'){
                    let newEffect = new Game.Effect(12, 'burning');
                    creatureReference.setEffect(newEffect);
                }
            } else{
                if (item._name === 'wand of fire'){
                    let tempList = []
                    tempList.push({x: endPointX, y: endPointY});
                    this._map.cellGrow(tempList, 'fireTile', 1, true);
                }
                Game.sendMessage(this, 'You shoot a blast of magic from a %s.',item.getName());
            }
        }

        if (this.hasMixin('Equipper')) {
            item.setUses(item.getUses() - 1);
        }
    },
    throwAttack: function(item, target, throwDistance) {
        Game.Screen.playScreen._lastTarget = target;
        target._isThrowTarget = true;
        targetIsDestructible = target.hasMixin('Destructible');
        if (targetIsDestructible){
            let defense = target.getDefenseValue();
            if (target.hasMixin('PlayerActor')) {
                defense = defense * 10;
            }
            let hitProbability = 90 * Math.pow(0.988, defense);
            if (throwDistance > 6) {
                hitProbability = hitProbability - throwDistance*3; 
            }
            if (target.hasMixin('Deflecter')){
                Game.sendMessage(this, 'You throw a %s at the %s. It deflects off its shell!', [item.getName(),target.getName()]);
            } else if (Math.random()*100 < hitProbability){
                let maxAmount = Math.max(1, item.getThrownAttackValue());
                if (this.hasMixin('PlayerActor')) {
                    if (item.getDamageType != undefined){
                        let damageType = item.getDamageType();
                        let targetIsVulnerable = target.getVulnerabilities().includes(damageType);
                        if (targetIsVulnerable){
                            maxAmount *= 2;
                        }
                        let targetIsResistant = target.getResistances().includes(damageType);
                        if (targetIsResistant){
                            maxAmount = Math.ceil(maxAmount / 2);
                        } 
                    } 
                }
                amount = maxAmount;
                if (amount > 0){
                    let returnMessage = target.takeDamage(this, amount, true);
                    if (returnMessage.length > 0){
                        Game.sendMessage(this, 'You throw a %s at %s for %d damage!' + returnMessage, [item.getName(),target.describeThe(false), amount]);
                    } else {
                        Game.sendMessage(this, 'You throw a %s at %s for %d damage!', [item.getName(),target.describeThe(false), amount]);
                    }
                } else {
                    Game.sendMessage(this, 'You throw a %s at %s. It misses.', [item.getName(),target.describeThe(false)]);
                }
            } else {
                Game.sendMessage(this, 'You throw a %s at %s. It misses.', [item.getName(),target.describeThe(false)]);
            }
        } else {
            Game.sendMessage(this, 'You throw a %s at %s.', [item.getName(),target.getName()]); 
        }
        
        //handle thrown potions
        //console.log("itemname:" + item._name);
        if( item._potionEffect !== null && item._potionEffect !== undefined){
            target.setEffect(item._potionEffect);
        } else if (item._name === "health potion" && targetIsDestructible === true){
            target.modifyHPBy(item._healthValue);
        } else if (item._name === "life potion" && targetIsDestructible === true){
            target.modifyMaxHPBy(Math.floor(target.getMaxHP()/5));
            target.modifyHPBy(item._healthValue);
        } else if (item._name === 'teleport potion'){
            var x = target.getX();
            var y = target.getY();
            var newX = 0;
            var newY = 0;

            while (!target.tryMoveTeleport(x + newX, y + newY) || Math.abs(newX) < 4 || Math.abs(newY) < 4){
                newX = Math.floor(Math.random() * 80) - 40;
                newY = Math.floor(Math.random() * 40) - 20;
            }

            target.setPosition(x + newX, y + newY);
        } else if (item._name === 'strength potion'){
            if (target.hasMixin('Attacker') && item._name === 'strength potion'){
                target.incrementStrength();
            }
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

Game.EntityMixins.Summoner = {
    name: 'Summoner',
    init: function(template) {
        this._summonCount = template['summonCount'] || 3;
        this._summonName = template['summonName'] || 'rat';
        this._summonWaitMax = template['summonWaitMax'] || 5;
        this._summonWait = template['summonWait'] || this._summonWaitMax;
        this._splitOnHit = template['splitOnHit'] || 0;
    },
    summon: function(entityName) {
        if (entityName === null || entityName === undefined){
            entityName = this._summonName;
        }
        var map = this.getMap();
        var alreadySummoned = 0; 

        let orderedSummonCoordinates = [
            [0,1],
            [0,-1],
            [1,0],
            [-1,0],
            [1,1],
            [1,-1],
            [-1,1],
            [-1,-1]
        ]

        for (coords of orderedSummonCoordinates){
            let x = coords[0];
            let y = coords[1];

            if (alreadySummoned >= this._summonCount) {
                break;
            }

            let newX = this.getX() + x;
            let newY = this.getY() + y;

            if (x == 0 && y == 0 || map.getEntityAt(newX, newY) != null){
                continue;
            }

            var creature = Game.EntityRepository.create(entityName);

            map.addEntity(creature);
            
            if (!creature.tryMove(newX, newY)){
                map.removeEntity(creature);
                continue;
            }

            alreadySummoned++;
        }
        this._summonWait = this._summonWaitMax;
        if (creature !== undefined){
          return creature;
        } else {
            return null;
        }
    }
}

Game.EntityMixins.Charger = {
    name: 'Charger',
    init: function(template) {
        this._chargeDirection = 'none';
    },
    getChargeDirection: function(){
        return this._chargeDirection
    },
    setChargeDirection: function(in_string){
        this._chargeDirection = in_string;
    }
}

Game.EntityMixins.Flyer = {
    name: 'Flyer',
    init: function(template) {
        template;
    }
}

// This signifies our entity posseses a field of vision of a given radius.
Game.EntityMixins.Sight = {
    name: 'Sight',
    groupName: 'Sight',
    init: function(template) {
        this._sightRadius = template['sightRadius'] || 7;
    },
    getSightRadius: function() {
        return this._sightRadius;
    },
    canSee: function(entity) {
        // If not on the same map or on different floors, then exit early
        if (!entity || this._map !== entity.getMap()) {
            return false;
        }

        if (this.hasMixin('Affectible') && this.hasEffect('blind')){
            return false;
        }

        if (entity.hasMixin('Affectible') && entity.hasEffect('invisible')){
            return false;
        }

        var otherX = entity.getX();
        var otherY = entity.getY();

        var seeAbleByMagic = (this.hasMixin('Affectible') && this.hasEffect("detecting") && this.getMap().getEntityAt(otherX, otherY) !== null);
        if (seeAbleByMagic){
            return true;
        }

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
    getFilledItems: function() {
        let filledItems = 0;
        for (let itemSlot of this._items){
            if (itemSlot !== null && itemSlot !== undefined){
                filledItems += 1;
            }
        }
        return filledItems;
    },
    getItem: function(i) {
        return this._items[i];
    },
    addItem: function(addedItem) {
        if (addedItem._name === 'gold'){
            Game.Screen.playScreen.goldCount++;
            return true; 
        }
        // Try to find a slot, returning true only if we could add the item.
        if (addedItem.hasMixin('Throwable')) {
            if (addedItem.isStackable()){
                for (let itemSlot of this._items) {
                    if (itemSlot !== undefined && itemSlot !== null){
                        if (itemSlot.describe() == addedItem.describe()) {
                            //stack the item if it's stackable and we already have one
                            itemSlot.setStackQuantity(itemSlot.getStackQuantity() + addedItem.getStackQuantity());
                            return true;
                        }
                    }
                }
            }
        }
        
        for (let i = 0; i < this._items.length; i++) {
            if (!this._items[i]) {
                this._items[i] = addedItem;
                return true;
            }
        }
        return false;
    },
    removeItem: function(i) {
        // If we can equip items, then make sure we unequip the item we are removing.
        if (this._items[i] && this.hasMixin('Equipper')) {
            this.unequip(this._items[i]);
        }
        // Simply clear the inventory slot.
        this._items[i] = null;
    },
    pickupItems: function(indices) {
        // Allows the user to pick up items from the map, where indices is
        // the indices for the array returned by map.getItemsAt
        var mapItems = this._map.getItemsAt(this.getX(), this.getY());
        var added = 0;
        // Iterate through all indices.
        for (var i = 0; i < indices.length; i++) {
            // Try to add the item. If our inventory is not full, then splice the item out of the map's list of items.
            // In order to fetch the right item, we have to offset the number of items already added.
            var item = mapItems[indices[i] - added];
            if (this.addItem(item)) {
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
                const coords = this._map.findFreeTile(this.getX(), this.getY());
                this._map.addItem(coords.x, coords.y, this._items[i]);
                Game.sendMessage(this, 'You drop the '+ this._items[i].describe() + ".");
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
        } else if(this.hasMixin('Affectible') && (!this.hasEffect('burning') || this._fireproof) && !this.hasEffect('poisoned')) {
            this.modifyHPBy(this._bleedRate);
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
        this._headPower = template["headPower"] || '';
    },
    tryDropHead: function() {
        if (Math.round(Math.random() * 100) < this._headDropRate) {
            // Create a new head item and drop it.
            const coords = this._map.findFreeTile(this.getX(), this.getY());
            this._map.addItem(coords.x, coords.y,
                Game.ItemRepository.create('head', {
                    name: this._name + ' head',
                    foreground: this._foreground,
                    headHits: this._headHits, 
                    power: this._headPower
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
        if (item._strengthRequirement > this.getStrengthValue()){
            Game.sendMessage(this, '%c{#F61067}This is too heavy for you to wield effectively.');
        }
    },
    unwield: function() {
        this._weapon = null;
    },
    wear: function(item) {
        this._armor = item;
        if (item._strengthRequirement > this.getStrengthValue()){
            Game.sendMessage(this, '%c{#F61067}This is too heavy for you to wear effectively.');
        }
    },
    unwear: function() {
        this._armor = null;
    },
    wearHead: function(item){
        this._head = item;
        if (this.hasMixin('PlayerActor')){
            this._armored = false;
            this._fierce = false;
            this._ratThreaten = false;
            this._toady = false;
            this._venomous = false;
            this._burner = false;
            this._strengthened = false;
            this._paralytic = false;
            this._pusher = false;
            this._sucker = false;
            this._levitating = false;
            this._vengeful = false;
            this._fireproof = false;

            if(this._head._name === 'goblin head' || this._head._name === 'kappa head'){
                this._armored = true;
            } else if (this._head._name === 'jackal head' || this._head._name === 'piranha head' || this._head._name === 'wraith head'){
                this._fierce = true;
            } else if (this._head._name === 'rat king head'){
                this._ratThreaten = true;
            } else if (this._head._name === 'toadman head' || this._head._name === 'toad queen head'){
                this._toady = true;
            } else if (this._head._name === 'poison toad head'){
                this._venomous = true;
            } else if (this._head._name === 'hydra head'){
                this._strengthened = true;
            } else if (this._head._name === 'giant bee head'){
                this._paralytic = true;
            } else if (this._head._name === 'golem head'){
                this._pusher = true;
                if (!this.pushEntity){
                    this.pushEntity = pushFunction;
                }
            } else if (this._head._name === 'vampire head'){
                this._sucker = true;
            } else if (this._head._name === 'devil head'){
                this._burner = true;
            } else if (this._head._name === 'harpy head'){
                this._levitating = true;
            } else if (this._head._name === 'cerberus head'){
                this._vengeful = true;
            } else if (this._head._name === 'underwyrm head'){
                this._fireproof = true;
            }
        }
    },
    unhead: function(){
        if (this.hasMixin('PlayerActor')){
            if(this._head._name === 'goblin head' || this._head._name === 'kappa head'){
                this._armored = false;
            } else if (this._head._name === 'jackal head' || this._head._name === 'piranha head' || this._head._name === 'wraith head'){
                this._fierce = false;
            } else if (this._head._name === 'rat king head'){
                this._ratThreaten = false;
            } else if (this._head._name === 'toadman head' || this._head._name === 'toad queen head'){
                this._toady = false;
            } else if (this._head._name === 'poison toad head'){
                this._venomous = false;
            } else if (this._head._name === 'giant bee head'){
                this._paralytic = false;
            } else if (this._head._name === 'golem head'){
                this._pusher = false;
            } else if (this._head._name === 'vampire head'){
                this._sucker= false;
            } else if (this._head._name === 'devil head'){
                this._burner = false;
            } else if (this._head._name === 'harpy head'){
                this._levitating = false;
            } else if (this._head._name === 'cerberus head'){
                this._vengeful = false;
            } else if (this._head._name === 'underwyrm head'){
                this._fireproof = false;
            }
        }
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
    },
    getArmorIndex: function(){
        for (var i = 0; i < this._items.length; i++) {
            if (this._items[i]) {
                // Check if the item is worn as a head
                if (this._items[i] === this.getArmor()) {
                    return i;
                }
            }
        }
        return null;
    },
    getWeaponIndex: function(){
        for (var i = 0; i < this._items.length; i++) {
            if (this._items[i]) {
                // Check if the item is worn as a head
                if (this._items[i] === this.getWeapon()) {
                    return i;
                }
            }
        }
        return null;
    },
    checkIfEquipped(item){
        if (this._weapon === item || this._armor === item || this._head === item){
            return true;
        } else {
            return false;
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
                if (stopActor) {return 1};
            } else {
                this.removeEffect(i)
            }
        }
        return 0;
    },
    applyEffect: function(effectName) {
        if (effectName === "poisoned" && this.hasMixin('Destructible')){
            let targetIsVulnerable = this.getVulnerabilities().includes('poison');
            if (targetIsVulnerable){
                let string = this.takeDamage('poison', 2, false);
                return string.length > 0 ? true : false;
            } else {
                let string = this.takeDamage('poison', 1, false);
                return string.length > 0 ? true : false;
            }      
        } else if (effectName === "burning" && this.hasMixin('Destructible') && !this.hasEffect('fireproof') && !this.hasMixin('Fireproof') && !this._fireproof){
            let targetIsVulnerable = this.getVulnerabilities().includes('fire');
            if (targetIsVulnerable){
                let string = this.takeDamage('fire', 2, false);
                return string.length > 0 ? true : false;
            } else {
                let string = this.takeDamage('fire', 1, false);
                return string.length > 0 ? true : false;
            }  
        }
    },
    transferEffects: function(effectsList){
        for (effect of effectsList){
            this.setEffect(effect);
        }
    },
    setEffect : function(effect) {
        if ((this.hasMixin('Unpoisonable') && effect._name === 'poisoned') || ( (this.hasMixin('Fireproof') || this.hasEffect('fireproof') || this._fireproof) && effect._name === 'burning')) {
            return;
        } else {
            this._effects.push(effect);
        }
    },
    removeEffect: function(index) {
        this._effects.splice(index,1);
    },
    hasEffect: function(effectName){
        var effects = this._effects;
        for (var i = 0; i < effects.length; i++){
            if (effectName === effects[i].getName()){
                return true;
            }
        }
        return false;
    }
}

Game.EntityMixins.Exploder = {
    name: 'Exploder',
    init: function(template){
        this._explodeTile = template['explodeTile'] || 'poisonTile';
        this._explodeSize = template['explodeSize'] || 10;
    }
}

Game.sendMessage = function(recipient, message, args) {
    // Make sure the recipient can receive the message before doing any work.
    if (recipient.hasMixin('MessageRecipient')) {
        // If args were passed, then we format the message, else no formatting is necessary
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
        if (entities[i].hasMixin('MessageRecipient')) {
            entities[i].receiveMessage(message);
        }
    }
}