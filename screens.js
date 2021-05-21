Game.Screen = {};

// Define our initial start screen
Game.Screen.startScreen = {
    enter: function() {console.log("Entered start screen."); },
    exit: function() { console.log("Exited start screen."); },
    render: function(display) {
        // Render our prompt to the screen
        display.drawText(1,1, "%c{yellow}Headless Panic");
        display.drawText(1,3, "%c{white}Betrayed. Beheaded. Thrown into the ancient cellars below the castle.");
        display.drawText(1,4, "%c{white}You pick your head up, put it on your neck, and try to get your bearings.");
        display.drawText(1,6, "%c{white}Press %c{yellow}[Enter] %c{white}to start!");
    },
    handleInput: function(inputType, inputData) {
        // When [Enter] is pressed, go to the play screen
        if (inputType === 'keydown') {
            if (inputData.keyCode === ROT.KEYS.VK_RETURN || inputData.keyCode === ROT.KEYS.VK_SPACE) {
                Game.switchScreen(Game.Screen.playScreen);
            }
        }
    }
}

// Define our playing screen
Game.Screen.playScreen = {
    _map: null,
    _player: null,
    _gameEnded: false,
    _subScreen: null,
    _lastTarget: null,
    alreadyGotList: [],
    deathInfo: {
        strength: 1,
        maxHP: 40,
        level: 1,
        weapon: 0,
        armor: 0
    },
    turnCount: 0,
    turnsOnThisFloorCount: 0,
    hasSpawnedDeath: false,
    enter: function() {  
        var width = Game._screenWidth;
        var height = Game._screenHeight;
        // Create our map from tiles and player
        let builder = new Game.Builder(width,height, Game.getLevel())
        let tiles = builder.getTiles()
        let gasMap = builder.makeEmptyGasMap();
        let rooms = builder.getRooms();
        let stairs = builder.getStairs();
        this._player = new Game.Entity(Game.PlayerTemplate);
        //starting player equipment
        var startingHead = Game.ItemRepository.create('head', {
            name: 'chicken head',
            foreground: '#fff'
        });
        this._player.addItem(startingHead);
        this._player.wearHead(startingHead);

        var dart = Game.ItemRepository.create('dart');
        this._player.addItem(dart);
        var dart = Game.ItemRepository.create('dart');
        this._player.addItem(dart);
        var dart = Game.ItemRepository.create('dart');
        this._player.addItem(dart);
        var dart = Game.ItemRepository.create('dart');
        this._player.addItem(dart);
        var dart = Game.ItemRepository.create('dart');
        this._player.addItem(dart);
        var dart = Game.ItemRepository.create('dart');
        this._player.addItem(dart);
        var dart = Game.ItemRepository.create('dart');
        this._player.addItem(dart);
        var dart = Game.ItemRepository.create('dart');
        this._player.addItem(dart);
        //Create map
        this._map = new Game.Map(tiles, this._player, null, stairs, gasMap);
        if (Game.getLevel() <= 6){
            //this._map.getRidOfBoringRooms(rooms);
            //TODO turning this off because it clears rooms after prefabs are generated, 
            //and it there's an overlap, you might have an orphanned prefab that the player can spawn in.
        }
        this._map.cleanUpDoors();
        // Start the map's engine
        this._map.getEngine().start();
     },
    exit: function() { console.log("Exited play screen."); },
    render: function(display) {
        if (this._subScreen) {
            this._subScreen.render(display);
            return;
        }
        
        var screenWidth = Game.getScreenWidth();
        var screenHeight = Game.getScreenHeight();

        // Render the tiles
        this.renderTiles(display);

        // Get the messages in the player's queue and render them
        var messages = this._player.getMessages();
        var messageY = screenHeight + 4;
        for (var i = 0; i < 4; i++) {
            // Draw each message, adding the number of lines
            if (messages[i] !== undefined){
                messageY -= display.drawText(
                    0, 
                    messageY,
                    '%c{white}%b{black}' + messages[i]
                );
            }
        }
        // Render UI 
        display.drawText(0, screenHeight, "%c{yellow}I%c{white}nventory  %c{yellow}L%c{white}ook  %c{yellow}W%c{white}ait  %c{yellow}T%c{white}hrow  %c{yellow}E%c{white}quip  %c{yellow}A%c{white}pply  %c{yellow}D%c{white}rop  %c{white}e%c{yellow}X%c{white}plore");

        var you = '%c{white}%b{black}';
        you += "@:    You";
        display.drawText(screenWidth + 1, 0, you);

        var playerHealth = this._player.getHP()/this._player.getMaxHP();
        var healthUIColor = (playerHealth > 0.66) ? "%c{white}" : ((playerHealth > 0.33) ? "%c{yellow}" : "%c{red}");
        var healthString = "%c{white}%b{black}HP:   " + healthUIColor + this._player.getHP() + "/" + this._player.getMaxHP();

        var currentHead = this._player.getHead();
        if (currentHead !== null){
            display.drawText(screenWidth + 1, 2, "%c{white}HEAD: " +  "%c{" + currentHead._foreground + "}"+ currentHead.getName());
            var numberOfHeadHits = currentHead.getHeadHits();
            for (var h = 0; h < numberOfHeadHits; h++){
                healthString +=  " \u2665";
            }
        } else {
            display.drawText(screenWidth + 1, 2, "HEAD: " + "%c{red}NONE");
        }
        //Finally, draw the health string on the prior line
        display.drawText(screenWidth + 1, 1, healthString);

        //Draw the effects for the player
        var effectsList = this._player.getEffects();
        var effectsString = '';
        for (effect of effectsList){
            var effectsString = effectsString + '%c{' + effect._color + '}' + effect.getName() + ' ';
        }
        display.drawText(screenWidth + 1, 3, effectsString);
        
        let strengthGap = 0;
        let strengthModifier = 0;
        let damageType = 'crush';
        let strengthValue = this._player.getStrengthValue();
        let attackValue = this._player.getAttackValue();
        let defenseValue = this._player.getDefenseValue();
        let levelName = this.getLevelName(); 
        if (this._player.getWeapon() !== null){
            damageType = this._player.getWeapon().getDamageType();
            strengthGap = strengthValue - this._player.getWeapon().getStrengthRequirement();
            if (strengthGap <  0){
                strengthModifier = 4 * strengthGap;
            } else if (strengthGap > 0){
                strengthModifier =  strengthGap;
            }
        }

        const isProtected =  this._player.hasEffect('protected');
        const isVulnerable = this._player.hasEffect('vulnerable');

        if (isVulnerable) {
            display.drawText(screenWidth + 1, 5, "%c{white}ARMR: " + "%c{" + Game.Colors.lichColor + "}" + "+" + defenseValue);
        } else if (isProtected) {
            display.drawText(screenWidth + 1, 5, "%c{white}ARMR: " + "%c{" + Game.Colors.effectDefault + "}" + "+" + defenseValue);
        } else {
            display.drawText(screenWidth + 1, 5, "%c{white}ARMR: +" + defenseValue);
        }

        display.drawText(screenWidth + 1, 6, "%c{white}DMG:  +" + (attackValue + strengthModifier) + ' ' + damageType);
        display.drawText(screenWidth + 1, 7, "%c{white}STRN: " + strengthValue);
           
        display.drawText(screenWidth + 1, 8, "%c{white}LVL:  " + levelName );   
    },
    handleInput: function(inputType, inputData, invokedManually) {
        // If the game is over, enter will bring the user to the losing screen.
        if (this._gameEnded) {
            if (inputType === 'keydown' && inputData.keyCode === ROT.KEYS.VK_RETURN) {
                Game.Screen.playScreen.deathInfo.maxHP = this._player.getMaxHP();
                Game.Screen.playScreen.deathInfo.murderer = this._player.murderer;
        
                let strengthGap = 0;
                let strengthModifier = 0;
                let damageType = 'crush';
                let strengthValue = this._player.getStrengthValue();
                let attackValue = this._player.getAttackValue();
                let defenseValue = this._player.getDefenseValue();
                if (this._player.getWeapon() !== null){
                    damageType = this._player.getWeapon().getDamageType();
                    strengthGap = strengthValue - this._player.getWeapon().getStrengthRequirement();
                    if (strengthGap <  0){
                        strengthModifier = 4 * strengthGap;
                    } else if (strengthGap > 0){
                        strengthModifier =  strengthGap;
                    }
                }

                Game.Screen.playScreen.deathInfo.level = Game.getLevel();
                Game.Screen.playScreen.deathInfo.strength = strengthValue;
                Game.Screen.playScreen.deathInfo.armor = defenseValue;
                Game.Screen.playScreen.deathInfo.weapon = ((attackValue + strengthModifier) + ' ' + damageType);
        
                Game.switchScreen(Game.Screen.loseScreen);
            }
            // Return to make sure the user can't still play
            return;
        }
        // Handle subscreen input if there is one
        if (this._subScreen) {
            this._subScreen.handleInput(inputType, inputData);
            return;
        }

        this._player._hasNotMovedThisTurn = true;

        if (inputType === 'keydown') {
            // Movement
            if (inputData.keyCode === ROT.KEYS.VK_LEFT) {
                if (!this._player.hasEffect('paralyzed')){
                    this.move(-1, 0);
                    this.handleItemPickup();
                    this.goDownStairs();
                    this._player.setPathingTarget(null);
                } else {
                    Game.sendMessage(this._player, "You are paralyzed!");
                }
            } else if (inputData.keyCode === ROT.KEYS.VK_RIGHT) {
                if (!this._player.hasEffect('paralyzed')){
                    this.move(1, 0);
                    this.handleItemPickup();
                    this.goDownStairs();
                    this._player.setPathingTarget(null);
                } else {
                    Game.sendMessage(this._player, "You are paralyzed!");
                }
            } else if (inputData.keyCode === ROT.KEYS.VK_UP) {
                if (!this._player.hasEffect('paralyzed')){
                    this.move(0, -1);
                    this.handleItemPickup();
                    this.goDownStairs();
                    this._player.setPathingTarget(null);
                } else {
                    Game.sendMessage(this._player, "You are paralyzed!");
                }
            } else if (inputData.keyCode === ROT.KEYS.VK_DOWN) {
                if (!this._player.hasEffect('paralyzed')){
                    this.move(0, 1);
                    this.handleItemPickup();
                    this.goDownStairs();
                    this._player.setPathingTarget(null);
                    
                } else {
                    Game.sendMessage(this._player, "You are paralyzed!");
                }
            } else if (inputData.keyCode === ROT.KEYS.VK_I) {
                if (this._player.getItems().filter(function(x){return x;}).length === 0) {
                    // If the player has no items, send a message and don't take a turn
                    Game.sendMessage(this._player, "You are not carrying anything!");
                    Game.refresh();
                } else {
                    // Show the inventory
                    Game.Screen.inventoryScreen.setup(this._player, this._player.getItems());
                    this.setSubScreen(Game.Screen.inventoryScreen);
                }
                return;
            } else if (inputData.keyCode === ROT.KEYS.VK_D) {
                if (this._player.getItems().filter(function(x){return x;}).length === 0) {
                    // If the player has no items, send a message and don't take a turn
                    Game.sendMessage(this._player, "You have nothing to drop!");
                    Game.refresh();
                } else {
                    // Show the drop screen
                    Game.Screen.dropScreen.setup(this._player, this._player.getItems());
                    this.setSubScreen(Game.Screen.dropScreen);
                }
                return;
            }  else if (inputData.keyCode === ROT.KEYS.VK_A) {
                // Show the apply screen
                if (Game.Screen.applyScreen.setup(this._player, this._player.getItems())) {
                    this.setSubScreen(Game.Screen.applyScreen);
                } else {
                    Game.sendMessage(this._player, "You have nothing to apply!");
                    Game.refresh();
                }
                return;
            } else if (inputData.keyCode === ROT.KEYS.VK_E) {
                // Show the equip screen
                if (Game.Screen.equipScreen.setup(this._player, this._player.getItems())) {
                    this.setSubScreen(Game.Screen.equipScreen);
                } else {
                    Game.sendMessage(this._player, "You have nothing to equip!");
                    Game.refresh();
                }
                return;
            } else if (inputData.keyCode === ROT.KEYS.VK_T) {
                // Show the equip screen
                if (Game.Screen.throwScreen.setup(this._player, this._player.getItems())) {
                    this.setSubScreen(Game.Screen.throwScreen);
                } else {
                    Game.sendMessage(this._player, "You have nothing to throw!");
                    Game.refresh();
                }
                return;
            } else if (inputData.keyCode === ROT.KEYS.VK_L) {
                // Setup the look screen.
                Game.Screen.lookScreen.setup(this._player, this._player.getX(), this._player.getY());
                this.setSubScreen(Game.Screen.lookScreen);
                return;
            } else if (inputData.keyCode === ROT.KEYS.VK_X) {
                let pathingTargets = [];
                let player = this._player;
                let map = this._map;
                let target = {};
                let noMoreUnexplored = false;

                //let's check to make sure this cell is still unexplored
                //this way, we don't have to reach the cell if we've seen it on the way there
                if (player.getPathingTarget()){
                    if(map.isExplored(player.getPathingTarget().x, player.getPathingTarget().y)){
                        player.setPathingTarget(null);
                    }
                }

                // Find an unexplored square
                if (player.getPathingTarget() === null){
                    if (invokedManually === false){
                        //we've hit our target in an auto-loop. Break out of the recursive function
                        return;
                    }
                    // if we've manually pressed explore and we have no target, find a new target
                    for (let x = 1; x < map.getWidth() - 1; x++) {
                        for (let y = 1; y < map.getHeight() - 1; y++) {
                            if (!map.isExplored(x, y)) {
                                pathingTargets.push({
                                    x: x,
                                    y: y
                                });
                            }
                        }
                    }
                    let sortedPathingTargets = map.sortByDistance(player.getX(), player.getY(), pathingTargets);

                    //find the closest reachable target
                    for (sortedTarget of sortedPathingTargets){
                        //try A*ing there
                        let path = new ROT.Path.AStar(sortedTarget.x, sortedTarget.y, function(in_x, in_y) {
                            let tile = map.getTile(in_x, in_y);
                            return tile.isWalkable() && !tile._isHazard && tile !== Game.Tile.stairsDownTile;
                        }, {topology: 4});
                        path.compute(player.getX(), player.getY(), function(x, y) {});
                        
                        //If we can get there, go to it
                        if(path._todo.length > 0){
                            target = {
                                x: sortedTarget.x,
                                y: sortedTarget.y
                            };
                            break;
                        }
                    }

                    //as long as there's still an unexplored tile we can reach...
                    if (Object.keys(target).length === 0 && target.constructor === Object){
                        noMoreUnexplored = true;
                    } else {
                        //Make a path to it
                        player.setPathingTarget(target);
                        //console.log(target);
                    }
                }

                if (!noMoreUnexplored){
                    let path = new ROT.Path.AStar(player.getPathingTarget().x, player.getPathingTarget().y, function(x, y) {
                        let tile = map.getTile(x, y);
                        return tile.isWalkable() && !tile._isHazard && tile !== Game.Tile.stairsDownTile;
                    }, {topology: 4});
                    //console.log(path);
                    
                    // Once we've gotten the path, we want to move to the second cell that is passed in the callback (the first is the entity's starting point)
                    let count = 0;
                    let handleItemPickupContext = this.handleItemPickup.bind(Game.Screen.playScreen);
                    let goDownStairsContext = this.goDownStairs.bind(Game.Screen.playScreen);
                    path.compute(player.getX(), player.getY(), function(x, y) {
                        if (count == 1) {
                            if (!player.hasEffect('paralyzed')){
                                player.tryMove(x, y);
                                handleItemPickupContext()
                                goDownStairsContext(); 
                            } else {
                                Game.sendMessage(this._player, "You are paralyzed!");
                            }
                            
                        }
                        count++;
                    });

                    if (path._todo.length === 0){
                        player.setPathingTarget(null);
                    }
                } else {
                    //if there are no more unexplored, start going to the stairs
                    let nextToStairs = map.getWalkableByStairs()

                    //console.log(map._stairs);
                    //console.log(nextToStairs)

                    let path = new ROT.Path.AStar(nextToStairs[0].x, nextToStairs[0].y, function(x, y) {
                        let tile = map.getTile(x, y);
                        return tile.isWalkable() && !tile._isHazard && tile !== Game.Tile.stairsDownTile;
                    }, {topology: 4});

                    let count = 0;
                    let handleItemPickupContext = this.handleItemPickup.bind(Game.Screen.playScreen);
                    let goDownStairsContext = this.goDownStairs.bind(Game.Screen.playScreen);
                    path.compute(player.getX(), player.getY(), function(x, y) {
                        if (count == 1) {
                            if (!player.hasEffect('paralyzed')){
                                player.tryMove(x, y);
                                handleItemPickupContext()
                                goDownStairsContext(); 
                            } else {
                                Game.sendMessage(this._player, "You are paralyzed!");
                            }
                        }
                        count++;
                    });

                    if (path._todo.length !== 0){
                        player.setPathingTarget(nextToStairs[0]);
                    }
                    
                }
            }
            // Unlock the engine
            this._map.getEngine().unlock();
            if (this._player.getPathingTarget()){
                let currentHead = this._player.getHead();
                if (currentHead !== null && inputData.keyCode === ROT.KEYS.VK_X && !this._map.areHunters()){
                    let thisReference = this;
                    let canSeeMonster = false;

                    this._map.getFov().compute(
                        this._player.getX(), this._player.getY(), 
                        this._player.getSightRadius(), 
                        function(x, y, radius, visibility) {
                            let key = x + ',' + y;
                            if (thisReference._map.getEntities()[key] !== undefined && (!thisReference._map.getEntities()[key].isNotMonster()) && thisReference._map.getEntities()[key].getName() !== 'chicken knight') {
                                //console.log(thisReference._map.getEntities()[key]);
                                canSeeMonster = true;
                            }
                            
                        }
                    );
                    if (!canSeeMonster){
                        let artificialInputData = {}
                        artificialInputData.keyCode = ROT.KEYS.VK_X
                        Game.sleep(30).then(() => { this.handleInput('keydown', artificialInputData, false) });
                    }
                }
            }
            this.turnCount++;
            this.turnsOnThisFloorCount++;
            if (this.turnsOnThisFloorCount > (Game._screenWidth * Game._screenHeight * .2605) && this.hasSpawnedDeath === false){
                this._map.addEntityAtDistantPosition(Game.EntityRepository.create("death"), this._player.getX(), this._player.getY(), 1);
                this.hasSpawnedDeath = true;
                Game.sendMessage(this._player, "%c{#F61067}--DEATH COMES FOR WHAT'S HERS--");
            }
        } else {
            // Not a valid key
            return;
        }
    },
    setGameEnded: function(gameEnded) {
        this._gameEnded = gameEnded;
    },
    move: function(dX, dY) {
        var newX = this._player.getX() + dX;
        var newY = this._player.getY() + dY;
        this.handleAltarUse(newX,newY);
        // Try to move to the new cell
        this._player.tryMove(newX, newY);
    },
    handleAltarUse: function(newX, newY) {
        let map = this._map;
        if (map.getTiles()[newX][newY] === Game.Tile.altarTile){
            if (Game.Screen.altarScreen.setup(this._player, this._player.getItems())) {
                map.getTiles()[newX][newY] = Game.Tile.rubbleTile;
                this.setSubScreen(Game.Screen.altarScreen);
            } else {
                Game.sendMessage(this._player, "You have nothing to put on the altar.");
            }
            
        }
    },
    setSubScreen: function(subScreen) {
        this._subScreen = subScreen;
        // Refresh screen on changing the subscreen
        Game.refresh();
    },
    goDownStairs(){
        let playerX = this._player.getX();
        let playerY = this._player.getY();
        let tile = this._map.getTile(playerX, playerY);
        let items = this._player.getItems()
        let playerHasKey = false;
        for (let item of items){
            if (item !== undefined && item !== null){
                if (item.describe() === 'key'){
                    playerHasKey = true;
                }
            }
        }
        if (tile === Game.Tile.stairsDownTile || tile === Game.Tile.stairsDownTileLocked && playerHasKey){
            if (Game.getLevel() === 15){
                Game.Screen.playScreen.deathInfo.maxHP = this._player.getMaxHP();
                Game.Screen.playScreen.deathInfo.murderer = this._player.murderer;
        
                let strengthGap = 0;
                let strengthModifier = 0;
                let damageType = 'crush';
                let strengthValue = this._player.getStrengthValue();
                let attackValue = this._player.getAttackValue();
                let defenseValue = this._player.getDefenseValue();
                if (this._player.getWeapon() !== null){
                    damageType = this._player.getWeapon().getDamageType();
                    strengthGap = strengthValue - this._player.getWeapon().getStrengthRequirement();
                    if (strengthGap <  0){
                        strengthModifier = 4 * strengthGap;
                    } else if (strengthGap > 0){
                        strengthModifier =  strengthGap;
                    }
                }

                Game.Screen.playScreen.deathInfo.level = Game.getLevel();
                Game.Screen.playScreen.deathInfo.strength = strengthValue;
                Game.Screen.playScreen.deathInfo.armor = defenseValue;
                Game.Screen.playScreen.deathInfo.weapon = ((attackValue + strengthModifier) + ' ' + damageType);

                Game.switchScreen(Game.Screen.winScreen);
                Game.refresh();
                return;
            }
            
            var width = Game._screenWidth;
            var height = Game._screenHeight;
            // Create our map from tiles and player
            Game.incrementLevel();
            this.turnsOnThisFloorCount = 0;
            this.hasSpawnedDeath = false;
            let builder = new Game.Builder(width,height, Game.getLevel())
            let tiles = builder.getTiles()
            let rooms = builder.getRooms();
            let stairs = builder.getStairs();
            let gasMap = builder.makeEmptyGasMap();
            //pass the current player and the new tiles in
            this._map = new Game.Map(tiles, this._player, this._player.getItems(), stairs, gasMap);
            if (Game.getLevel() <= 6){
                //this._map.getRidOfBoringRooms(rooms);
                //TODO turning this off because it clears rooms after prefabs are generated, 
                //and it there's an overlap, you might have an orphanned prefab that the player can spawn in.
            }
            if (Game.getLevel() <= 6 && Game.getLevel() > 3){
                this._map.deleteHalfOfDoors();
            }
            this._map.cleanUpDoors();
            // Start the map's engine
            this._map.getEngine().start();
            if (playerHasKey){
                Game.sendMessage(this._player, "%c{#61AEEE}You use the key on the trapdoor.");
                Game.sendMessage(this._player, "%c{#61AEEE}You go down the stairs. They crumble to dust behind you.");
                for (let i = 0; i < items.length; i ++){
                    if (items[i] !== undefined && items[i] !== null){
                        if (items[i].describe() === 'key'){
                            items[i] = null;
                        }
                    }
                }
            } else {
                Game.sendMessage(this._player, "%c{#61AEEE}You go down the stairs. They crumble to dust behind you.");
            }
        }
    },
    handleItemPickup(){
        var items = this._map.getItemsAt(this._player.getX(), this._player.getY());
        if (!items) {
            return;
        } else if (items.length === 1) {
            // If only one item, try to pick it up
            var item = items[0];
            if (this._player.pickupItems([0])) {
                if (item.getName() === 'key'){
                    Game.sendMessage(this._player, "%%c{#61AEEE}You pick up %s.", [item.describeA()]);
                } else {
                    Game.sendMessage(this._player, "You pick up %s.", [item.describeA()]);
                }
            } else {
                Game.sendMessage(this._player, "Your inventory is full! Nothing was picked up.");
            }
        } else {
            if (this._player.getFilledItems() != 20){
                // Show the pickup screen if there are any items
                Game.Screen.pickupScreen.setup(this._player, items);
                this.setSubScreen(Game.Screen.pickupScreen);
                return;
            } else {
                Game.sendMessage(this._player, "Your inventory is full! Nothing was picked up.");
            }      
        }
    },
    renderTiles(display){
        var visibleCells = {}
        // Store this._map to prevent losing it in callbacks
        var map = this._map;
        //Find all visible cells
        this._map.getFov().compute(
            this._player.getX(), this._player.getY(), 
            this._player.getSightRadius(), 
            function(x, y, radius, visibility) {
                visibleCells[x + "," + y] = true;
                // Mark cell as explored
                map.setExplored(x, y, true);
            });

        var screenWidth = Game.getScreenWidth();

        // Render the explored map cells
        var j = 0;
        for (var x = 0; x < this._map.getWidth(); x++) {
            for (var y = 0; y < this._map.getHeight(); y++) {
                if (map.isExplored(x, y)) {
                    // Fetch the glyph for the tile and render it to the screen
                    let glyph = this._map.getTile(x, y);
                    let foreground = glyph.getForeground();
                    let tile = this._map.getTile(x, y);
                    let background = tile.getBackground();
                    // If we are at a cell that is in the field of vision, we need
                    // to check if there are items or entities.
                    if (visibleCells[x + ',' + y]) {
                        // Check for items first to draw over the floor
                        let items = map.getItemsAt(x, y);
                        let tile = map.getTile(x,y);
                        let gas = map.getGas(x,y)
                        //If we have stairs, we want to render them in the sidebar
                        if (!this._player.hasEffect('blind')){
                            if ( tile === Game.Tile.stairsDownTile) {
                                display.drawText(screenWidth + 1, 10 + j , '%c{' + tile._foreground + '}' + tile._char + ':  ' + 'stairs down');
                                j+=1;
                            }
                            if ( tile === Game.Tile.stairsDownTileLocked) {
                                display.drawText(screenWidth + 1, 10 + j , '%c{' + tile._foreground + '}' + tile._char + ':  ' + 'locked stairs down');
                                j+=1;
                            }
                            if (tile === Game.Tile.altarTile) {
                                display.drawText(screenWidth + 1, 10 + j , '%c{' + tile._foreground + '}' + tile._char + ':  ' + 'wand altar');
                                j+=1;
                            }
                            // If we have items, we want to render the top most item
                            if (items) {
                                glyph = items[items.length - 1];
                                let strSuffix = '';
                                if (glyph.hasMixin('Equippable')){
                                    strSuffix = (glyph.getStrengthRequirement() > 1 ? ' [' + glyph.getStrengthRequirement() + ']' : '');
                                }
                                display.drawText(screenWidth + 1, 10 + j , '%c{' + glyph._foreground + '}' + glyph._char + ':  ' + glyph._name + strSuffix);
                                j++;
                                // Update the foreground color in case our glyph changed
                                foreground = glyph.getForeground();
                            }
                            //If we have gasses, we want to render them over the background
                            if (gas !== null) {
                                foreground = gas.getForeground()
                                background = gas.getBackground()
                            }
                        }
                    } else {
                        let items = map.getItemsAt(x, y);
                        // If we have items, we want to render the top most item
                        if (items) {
                            glyph = items[items.length - 1];
                            foreground = items[items.length - 1].getForeground();
                        }
                        // Since the tile was previously explored but is not visible,
                        // we want to change the foreground color to dark gray.
                        foreground = ROT.Color.toHex(ROT.Color.multiply(ROT.Color.fromString(foreground),[80,80,130]));
                        background = ROT.Color.toHex(ROT.Color.multiply(ROT.Color.fromString(background),[80,80,130]));
                    }
                    if (!this._player.hasEffect('blind')){
                        display.draw(x, y, glyph.getChar(), foreground, background);
                    }
                }
            }
        }
        // Render the entities
        if (!this._player.hasEffect('blind')){
            let entities = this._map.getEntities();
            let visibleEntities = [];
            let currentHead = this._player.getHead();

            //var screenWidth = Game.getScreenWidth();

            for (let key in entities) {
                let entity = entities[key];
                let tile = this._map.getTile(entity.getX(), entity.getY());
                let gas = this._map.getGas(entity.getX(), entity.getY());
                let background = gas !== null ? gas.getBackground() : tile.getBackground();
                if (visibleCells[entity.getX() + ',' + entity.getY()] || (this._player.hasEffect('knowledgeable') && entity.isNotMonster() == false)) {
                    if(entity.hasMixin('PlayerActor')){
                        if (currentHead !== null){
                            display.draw(entity.getX(), entity.getY(), entity.getChar(), entity.getForeground(), background);
                        } else {
                            display.draw(entity.getX(), entity.getY(), entity.getChar(), '#F61067', background);
                        }
                    } else if (!entity.isNotMonster()) {
                        display.draw(entity.getX(), entity.getY(), entity.getChar(), entity.getForeground(), background);
                    } else {
                        display.draw(entity.getX(), entity.getY(), entity.getChar(), entity.getForeground(), entity.getBackground());
                    }
                    if (!entity.hasMixin('PlayerActor') && entity.isNotMonster() === false){
                        visibleEntities.push(entity);
                    }
                }
            }
            
            for (var i=0; i < visibleEntities.length; i++){
                var visibleEntity = visibleEntities[i]
                let isDestructible = visibleEntity.hasMixin('Destructible');
                if (isDestructible){
                    display.drawText(screenWidth + 1, 10 + 2*i + j , '%c{' + visibleEntity.getForeground() + '}' + visibleEntity.getChar() + ':  ' + visibleEntity.getName() + '%c{' + visibleEntity.getForeground() + '} '  + visibleEntity.getHP() + '/' + visibleEntity.getMaxHP());
                } else {
                    display.drawText(screenWidth + 1, 10 + 2*i + j , '%c{' + visibleEntity.getForeground() + '}' + visibleEntity.getChar() + ':  ' + visibleEntity.getName() + '%c{' + visibleEntity.getForeground() + '} ');
                }
                
                var effectsList = visibleEntity.hasMixin('Affectible') ? visibleEntity.getEffects() : [];
                var effectsString = '';
                for (effect of effectsList){
                    var effectsString = effectsString + '%c{' + effect._color + '}' + effect.getName() + ' ';
                }
                display.drawText(screenWidth + 1, 11 + 2*i + j, effectsString);
            }
        }
    },
    getLevelName(){
        if (Game.getLevel() < 4){
            return "Cellars " + Game.getLevel();
        } else if (Game.getLevel() < 7){
            return "Sewers " + (Game.getLevel() - 3);
        } else if (Game.getLevel() < 10) {
            return "Caverns " + (Game.getLevel() - 6);
        } else if (Game.getLevel() < 13) {
            return "Catacombs " + (Game.getLevel() - 9);
        } else {
            return "Underworld " + (Game.getLevel() - 12);
        }
    }
}

// Define our winning screen
Game.Screen.winScreen = {
    enter: function() { console.log("Entered win screen."); },
    exit: function() { console.log("Exited win screen."); },
    render: function(display) {
        gtag('event', 'death_stats', {'strength': Game.Screen.playScreen.deathInfo.strength, 'hp': Game.Screen.playScreen.deathInfo.maxHP, 'defense': Game.Screen.playScreen.deathInfo.armor, 'damage': Game.Screen.playScreen.deathInfo.weapon, 'level': Game.Screen.playScreen.deathInfo.level, 'turns': Game.Screen.playScreen.turnCount, 'murderer': 'survived'});

        // Render our prompt to the screen
        display.drawText(2, 1, "%c{yellow}You win the Headless Panic Beta!");
        display.drawText(2, 3, "Thank you for playing!");
        display.drawText(2, 5, "Come back to play the expanded game next month.");
    },
    handleInput: function(inputType, inputData) {
        // Nothing to do here      
    }
}

// Define our winning screen
Game.Screen.loseScreen = {
    enter: function() { console.log("Entered lose screen."); },
    exit: function() { console.log("Exited lose screen."); },
    render: function(display) {
        // Render our prompt to the screen
        display.drawText(2, 1, "You were killed on LVL " +  Game.Screen.playScreen.deathInfo.level + " of 15 by " + Game.Screen.playScreen.deathInfo.murderer + '.');
        display.drawText(2, 3, "STRN: " +  Game.Screen.playScreen.deathInfo.strength);
        display.drawText(2, 4, "MAX HP: " +  Game.Screen.playScreen.deathInfo.maxHP);
        display.drawText(2, 5, "DMG: " +  Game.Screen.playScreen.deathInfo.weapon);
        display.drawText(2, 6, "ARMR: " +  Game.Screen.playScreen.deathInfo.armor);
        display.drawText(2, 7, "TURNS: " +  Game.Screen.playScreen.turnCount);
        display.drawText(2, 9,  Game.Screen.loseScreen.chooseHint());
        display.drawText(2, 11, "%c{yellow}Refresh your browser tab to restart.");
        // Sends an event that passes 'death stats'
        gtag('event', 'death_stats', {'strength':  Game.Screen.playScreen.deathInfo.strength, 'hp':  Game.Screen.playScreen.deathInfo.maxHP, 'defense':  Game.Screen.playScreen.deathInfo.armor, 'damage':  Game.Screen.playScreen.deathInfo.weapon, 'level':  Game.Screen.playScreen.deathInfo.level, 'turns': Game.Screen.playScreen.turnCount, 'murderer': Game.Screen.playScreen.deathInfo.murderer});
    },
    handleInput: function(inputType, inputData) {
        // Nothing to do here      
    },
    chooseHint: function(){
        var hintList = [
            "Avoiding fights is as good as winning them, especially if an enemy doesn't have a head to drop.",
            "Wielding a weapon with insufficient strength greatly reduces chance to hit and max hit.",
            "Weapons and armor with Strength requirements show the required Strength level in brackets.",
            "Wielding a weapon with excess strength increases chance to hit and max hit.",
            "Wearing an enemy's head gives you one of their powers.",
            "The further you throw a weapon, the less likely it is to hit an enemy.",
            "Press X to eXplore automatically. It's not as smart as manual control, but it's easier on your fingers.",
            "Press L to Look at new monsters to learn something about them.",
            "The only way to raise your Strength (STR) is by drinking a Strength Potion.",
            "Weapons and armor have a Strength requirement. If you don't meet this requirement, the weapons and armor will perform MUCH worse.",
            "Weapons and armor have a Strength requirement. If you exceed this requirement, the performance of these items will scale with your strength.",
            "Weapons each have a damage type (crush, slash, or stab). Certain enemies are resistant to or vulnerable to certain damage types.",
            "Keep trying! Knowledge of monsters and items will drastically improve your chances of survival.",
            "Strength Potions, Life Potions, and Altars are the most important items for tackling the dungeon.",
            /*"When aiming a projectile, it's sometimes possible to hit targets that seem out of reach. Try adjusting the targeting reticule to a position behind them.",*/
        ];
        return hintList[Math.floor(Math.random() * hintList.length)];
    }
}

Game.Screen.ItemListScreen = function(template) {
    // Set up based on the template
    this._caption = template['caption'];
    this._okFunction = template['ok'];
    // By default, we use the identity function
    this._isAcceptableFunction = template['isAcceptable'] || function(x) {
        return x;
    }
    // Whether the user can select items at all.
    this._canSelectItem = template['canSelect'];
    // Whether the user can select multiple items.
    this._canSelectMultipleItems = template['canSelectMultipleItems'];
};

Game.Screen.ItemListScreen.prototype.setup = function(player, items) {
    this._player = player;
    // Should be called before switching to the screen.
    var count = 0;
    // Iterate over each item, keeping only the aceptable ones and counting the number of acceptable items.
    var that = this;
    this._items = items.map(function(item) {
        // Transform the item into null if it's not acceptable
        if (that._isAcceptableFunction(item)) {
            count++;
            return item;
        } else {
            return null;
        }
    });
    // Clean set of selected indices
    this._selectedIndices = {};
    return count;
};

Game.Screen.ItemListScreen.prototype.render = function(display) {
    let letters = 'abcdefghijklmnopqrstuvwxyz';
    // Render the caption in the top row
    display.drawText(0, 0, this._caption);
    let row = 0;
    let itemSortList = [];
    for (let i = 0; i < this._items.length; i++) {
        // If we have an item, we want to render it.
        let isWearable = false;
        let isWieldable = false;
        let isHeadible = false;
        let isUsable = false;
        let isEdible = false;
        if (this._items[i]) {
            // Get the letter matching the item's index
            let letter = letters.substring(i, i + 1);
            // If we have selected an item, show a +, else show a dash between
            // the letter and the item's name.
            let selectionState = (this._canSelectItem && this._canSelectMultipleItems &&
                this._selectedIndices[i]) ? '+' : '-';
            // Render at the correct row and add 2.
            // Check if the item is worn or wielded
            let glyph = this._items[i].getChar()
            let foreground = this._items[i].getForeground(); 
            let prefix = '%c{white}';
            let suffix = '';
            if (this._items[i] === this._player.getArmor()) {
                prefix = '%c{#61AEEE}';
                suffix = ' (wearing)';
            } else if (this._items[i] === this._player.getWeapon()) {
                prefix = '%c{#61AEEE}';
                suffix = ' (in hand)';
            } else if (this._items[i] === this._player.getHead()) {
                prefix = '%c{#61AEEE}';
                suffix = ' (on neck)';
            }

            if (this._items[i].hasMixin('Throwable') && this._items[i].isStackable()) {
                suffix += ' (x' + this._items[i].getStackQuantity() + ')';
            }
            if (this._items[i].hasMixin('Usable')) {
                isUsable = true;
                suffix += ' (' + this._items[i].getUses() + '/' + this._items[i].getMaxUses() + ')';
            }
            if (this._items[i].hasMixin('Edible')) {
                isEdible = true;
            }
            if (this._items[i].hasMixin('Equippable')) {
                isWearable = this._items[i].isWearable();
                isWieldable = this._items[i].isWieldable();
                isHeadible = this._items[i].isHeadible();
                let strengthReq = this._items[i].getStrengthRequirement()
                if (strengthReq > 1){
                    suffix += ' [' + strengthReq +  ']';
                } 
            }

            itemSortList[i] = {
                string: letter + ' ' + selectionState + ' ' + '%c{'+ foreground +'}' + glyph + ' ' + prefix + this._items[i].describe() + suffix,
                isUsable: isUsable,
                isWearable: isWearable,
                isWieldable: isWieldable,
                isHeadible: isHeadible,
                isEdible: isEdible,
                itemName: this._items[i].describe()
            } 
        } 
    }

    itemSortList = this.sortItemsByType(itemSortList);

    for (let i = 0; i < itemSortList.length; i++) {
        // Render at the correct row and add 2.
        display.drawText(0, 2 + row,  itemSortList[i].string);
        row++;
    }

    if (this._canSelectMultipleItems){
        display.drawText(0, 2 + row + 1, '%c{yellow}[ENTER]');
    }
};

Game.Screen.ItemListScreen.prototype.executeOkFunction = function() {
    // Gather the selected items.
    var selectedItems = {};
    for (var key in this._selectedIndices) {
        selectedItems[key] = this._items[key];
    }
    // Switch back to the play screen.
    Game.Screen.playScreen.setSubScreen(undefined);
    // Call the OK function and end the player's turn if it returns true.
    if (this._okFunction(selectedItems)) {
        this._player.getMap().getEngine().unlock();
    }
};

Game.Screen.ItemListScreen.prototype.sortItemsByType = function(itemList) {
    let headArray = itemList.filter(item => item.isHeadible);
    let wearArray = itemList.filter(item => item.isWearable);
    let wieldArray = itemList.filter(item => item.isWieldable && !item.isUsable);
    let useArray = itemList.filter(item => item.isUsable);
    let potionArray = itemList.filter(item => !item.isHeadible && !item.isWearable && !item.isWieldable && !item.isUsable && item.isEdible);
    let otherArray = itemList.filter(item => !item.isHeadible && !item.isWearable && !item.isWieldable && !item.isUsable && !item.isEdible);
    
    let sortByName = function(objList){
        objList.sort((a, b) => (a.itemName > b.itemName) ? 1 : -1);
        return objList;
    }

    headArray = sortByName(headArray);
    wearArray = sortByName(wearArray);
    wieldArray = sortByName(wieldArray);
    useArray = sortByName(useArray);
    potionArray = sortByName(potionArray);
    otherArray = sortByName(otherArray);

    if (headArray.length > 0) {
        headArray.unshift({string: '%c{#CCCCCC}HEADS'})
    }
    if (wearArray.length > 0) {
        wearArray.unshift({string: '%c{#CCCCCC}ARMOR'})
    }
    if (wieldArray.length > 0) {
        wieldArray.unshift({string: '%c{#CCCCCC}WEAPONS'})
    }
    if (useArray.length > 0) {
        useArray.unshift({string: '%c{#CCCCCC}WANDS'})
    }
    if (potionArray.length > 0) {
        potionArray.unshift({string: '%c{#CCCCCC}POTIONS'})
    }
    if (otherArray.length > 0) {
        otherArray.unshift({string: '%c{#CCCCCC}OTHER'})
    }

    let out_array = headArray.concat(wearArray).concat(wieldArray).concat(useArray).concat(potionArray).concat(otherArray);
    return out_array;
};

Game.Screen.ItemListScreen.prototype.handleInput = function(inputType, inputData) {
    if (inputType === 'keydown') {
        // If the user hit escape, hit enter and can't select an item, or hit
        // enter without any items selected, simply cancel out
        if (inputData.keyCode === ROT.KEYS.VK_ESCAPE || 
            (inputData.keyCode === ROT.KEYS.VK_RETURN && 
                (!this._canSelectItem || Object.keys(this._selectedIndices).length === 0))) {
            Game.Screen.playScreen.setSubScreen(undefined);
        // Handle pressing return when items are selected
        } else if (inputData.keyCode === ROT.KEYS.VK_RETURN) {
            this.executeOkFunction();
        // Handle pressing a letter if we can select
        } else if (this._canSelectItem && inputData.keyCode >= ROT.KEYS.VK_A &&
            inputData.keyCode <= ROT.KEYS.VK_Z) {
            // Check if it maps to a valid item by subtracting 'a' from the character
            // to know what letter of the alphabet we used.
            var index = inputData.keyCode - ROT.KEYS.VK_A;
            if (this._items[index]) {
                // If multiple selection is allowed, toggle the selection status, else
                // select the item and exit the screen
                if (this._canSelectMultipleItems) {
                    if (this._selectedIndices[index]) {
                        delete this._selectedIndices[index];
                    } else {
                        this._selectedIndices[index] = true;
                    }
                    // Redraw screen
                    Game.refresh();
                } else {
                    // clear it out selected indices to make sure we're only sending one index 
                    // (in case we've come back from the itemScreen a couple times)
                    this._selectedIndices = [];
                    this._selectedIndices[index] = true;
                    this.executeOkFunction();
                }
            }
        }
    }
};

Game.Screen.applyScreen = new Game.Screen.ItemListScreen({
    caption: 'Apply what?',
    canSelect: true,
    canSelectMultipleItems: false,
    isAcceptable: function(item) {
        return item && (item.hasMixin('Edible') || item.hasMixin('Usable'));
    },
    ok: function(selectedItems) {
        // Eat the item
        var key = Object.keys(selectedItems)[0];
        var item = selectedItems[key];
        if (item.hasMixin('Edible')){
            Game.sendMessage(this._player, "You drink %s.", [item.describeThe()]);
            item.eat(this._player);
            this._player.removeItem(key);
            return false;
        } else if (item.hasMixin('Usable') && item.getUses() > 0){
            Game.Screen.aimAtScreen.setup(this._player, this._player.getX(), this._player.getY(), item, key);
            Game.Screen.playScreen.setSubScreen(Game.Screen.aimAtScreen);            
        } else if (item.hasMixin('Usable') && item.getUses() === 0){
            Game.sendMessage(this._player, "%c{#F61067}The %s is out of charges.", [item.describe()]);
        }
        return true;
    }
});

//This needs its own OK function because shooting a wand takes 2 screens, unlike a normal executeOkFunction
Game.Screen.applyScreen.executeOkFunction = function(){
    // Gather the selected items.
    var selectedItems = {};
    for (var key in this._selectedIndices) {
        selectedItems[key] = this._items[key];
    }
    // Switch back to the play screen.
    Game.Screen.playScreen.setSubScreen(undefined);
    // Call the OK function and move to the aim screen WITHOUT ending the player's turn if returns true;
    if (this._okFunction(selectedItems)) {
        var blah;
    } else {
        // if it's edible, the _okayFunction will false and we'll unlock the map
        this._player.getMap().getEngine().unlock();
    }
}

Game.Screen.equipScreen = new Game.Screen.ItemListScreen({
    caption: 'Equip what?',
    canSelect: true,
    canSelectMultipleItems: false,
    isAcceptable: function(item) {
        return item && item.hasMixin('Equippable')
    },
    ok: function(selectedItems) {
        // Check if we selected 'no item'
        var keys = Object.keys(selectedItems);
        if (keys.length === 0) {
            this._player.unwield();
            Game.sendMessage(this._player, "You are empty handed.")
        } else {
            var item = selectedItems[keys[0]];
            if (item.isWieldable()){
                this._player.wield(item);
                Game.sendMessage(this._player, "You are wielding %s.", [item.describeA()]);
            } else if (item.isWearable()){
                this._player.wear(item);
                Game.sendMessage(this._player, "You are wearing %s.", [item.describe()]);
            } else if (item.isHeadible()){
                this._player.wearHead(item);
                Game.sendMessage(this._player, "You are wearing %s.", [item.describeA()]);
            } 
        }
        return true;
    }
});

Game.Screen.altarScreen = new Game.Screen.ItemListScreen({
    caption: 'Which wand do you want to put on the altar?',
    canSelect: true,
    canSelectMultipleItems: false,
    isAcceptable: function(item) {
        return item && item.hasMixin('Usable')
    },
    ok: function(selectedItems) {
        // Check if we selected 'no item'
        var keys = Object.keys(selectedItems);
        if (keys.length === 0) {
            Game.sendMessage(this._player, "You don't have any wands.")
        } else {
            var item = selectedItems[keys[0]];
            item.setUses(item.getMaxUses());
            Game.sendMessage(this._player, "You put your wand on the altar. There is a flash of light and the altar crumbles!");
        }
        return true;
    }
});

Game.Screen.inventoryScreen = new Game.Screen.ItemListScreen({
    caption: 'Inventory',
    canSelect: true,
    canSelectMultipleItems: false,
    ok: function(selectedItems){
        var key = Object.keys(selectedItems)[0];
        var item = selectedItems[key];
        Game.Screen.itemScreenGeneric.setup(this._player, item, this, key);
        Game.Screen.playScreen.setSubScreen(Game.Screen.itemScreenGeneric);
    }
});

Game.Screen.pickupScreen = new Game.Screen.ItemListScreen({
    caption: 'Pick up what?',
    canSelect: true,
    canSelectMultipleItems: true,
    ok: function(selectedItems) {
        // Try to pick up all items, messaging the player if they couldn't all be picked up.
        if (!this._player.pickupItems(Object.keys(selectedItems))) {
            Game.sendMessage(this._player, "Your inventory is full! Not all items were picked up.");
        }
        return true;
    }
});

Game.Screen.dropScreen = new Game.Screen.ItemListScreen({
    caption: 'Drop what?',
    canSelect: true,
    canSelectMultipleItems: false,
    ok: function(selectedItems) {
        // Drop the selected item
        this._player.dropItem(Object.keys(selectedItems)[0]);
        return true;
    }
});

Game.Screen.throwScreen = new Game.Screen.ItemListScreen({
    caption: 'Throw what?',
    canSelect: true,
    canSelectMultipleItems: false,
    isAcceptable: function(item) {
        return item && item.hasMixin('Throwable');
    },
    ok: function(selectedItems) {
        // throw the item
        var key = Object.keys(selectedItems)[0];
        var item = selectedItems[key];
        
        Game.Screen.throwAtScreen.setup(this._player, this._player.getX(), this._player.getY(), item, key);
        Game.Screen.playScreen.setSubScreen(Game.Screen.throwAtScreen);
        return true;
    }
});

//This needs its own OK function because throwing takes 2 screens, unlike a normal executeOkFunction
Game.Screen.throwScreen.executeOkFunction = function(){
    // Gather the selected items.
    var selectedItems = {};
    for (var key in this._selectedIndices) {
        selectedItems[key] = this._items[key];
    }
    // Switch back to the play screen.
    Game.Screen.playScreen.setSubScreen(undefined);
    // Call the OK function and move to the throw screen WITHOUT ending the player's turn if returns true;
    if (this._okFunction(selectedItems)) {
        var blah;
    }
}

Game.Screen.TargetBasedScreen = function(template) {
    template = template || {};
    // By default, our ok return does nothing and does not consume a turn.
    this._okFunction = template['ok'] || function(x, y) {
        return false;
    };
    // The defaut caption function simply returns an empty string.
    this._captionFunction = template['captionFunction'] || function(x, y) {
        return '';
    }
};

Game.Screen.TargetBasedScreen.prototype.setup = function(player, startX, startY, item, key) {
    this._player = player;
    // Store original position.
    this._startX = startX;
    this._startY = startY;
    this._item = item || null;	
    this._key = key || null;
    // Cache the FOV
    var visibleCells = {};
    this._player.getMap().getFov().compute(
        this._player.getX(), this._player.getY(), 
        this._player.getSightRadius(), 
        function(x, y, radius, visibility) {
            visibleCells[x + "," + y] = true;
        });
    this._visibleCells = visibleCells;

    // Store current cursor position
    let lastTargetX = 0;
    let lastTargetY = 0;
    let lastTarget = Game.Screen.playScreen._lastTarget;

    if (lastTarget !== null){
        if (this._visibleCells[lastTarget.getX() + ',' + lastTarget.getY()]){
            lastTargetX = lastTarget.getX()
            lastTargetY = lastTarget.getY()
        } else {
            Game.Screen.playScreen._lastTarget = null;
            lastTargetX = this._startX;
            lastTargetY = this._startY;
        }
    } else {
        lastTargetX = this._startX;
        lastTargetY = this._startY;
    }
    this._cursorX = lastTargetX;
    this._cursorY = lastTargetY;
};

Game.Screen.TargetBasedScreen.prototype.render = function(display) {
    Game.Screen.playScreen.renderTiles.call(Game.Screen.playScreen, display);

    // Draw a line from the start to the cursor.
    var points = Game.Geometry.getLine(this._startX, this._startY, this._cursorX, this._cursorY);
    var foregroundColor =  "#333333";
    var character = "?";

    var map = this._player.getMap();

    // Render yellow along the line.
    for (var i = 0, l = points.length; i < l; i++) {
        var x = points[i].x
        var y = points[i].y

        // If the tile is explored, we can give a better tile image
        if (map.isExplored(x, y)) {
            // If the tile isn't explored, we have to check if we can actually see it before testing if there's an entity or item.
            if (this._visibleCells[x + ',' + y]) {
                var items = map.getItemsAt(x, y);
                // If we have items, we want to render the top most item
                if (items) {
                    var item = items[items.length - 1];
                    foregroundColor = item.getForeground();
                    character = item.getChar();
                // Else check if there's an entity
                } else if (map.getEntityAt(x, y)) {
                    var entity = map.getEntityAt(x, y);
                    foregroundColor = entity.getForeground();
                    character = entity.getChar();
                } else {
                    // If there was no entity/item or the tile wasn't visible, then use
                    // the tile information.
                    var tile = map.getTile(x, y)
                    foregroundColor = tile.getForeground();
                    character = tile.getChar();
                }
            } else {
                    //if tile is explored but not visible, check for items, otherwise use tile
                    var items = map.getItemsAt(x, y);
                    if (items) {
                        var item = items[items.length - 1];
                        foregroundColor = item.getForeground();
                        character = item.getChar();
                    // Else get tile info
                    } else {
                        var tile = map.getTile(x, y)
                        foregroundColor = tile.getForeground();
                        character = tile.getChar();
                    }
                    
            }
        } else {
            // If the tile is not explored, show no new info to user.
            foregroundColor =  "#333333";
            character = "?";
        }
        
        //var tile = this._player.getMap().getTile(x,y)
        display.drawText(x, y, '%c{' + foregroundColor + '}%b{yellow}' + character);
    }

    // Render the caption at the bottom.
    display.drawText(0, Game.getScreenHeight(), this._captionFunction(this._cursorX , this._cursorY));
    display.drawText(0, Game.getScreenHeight()+1, '%c{yellow}[ENTER]');
};

Game.Screen.TargetBasedScreen.prototype.handleInput = function(inputType, inputData) {
    // Move the cursor
    if (inputType == 'keydown') {
        if (inputData.keyCode === ROT.KEYS.VK_LEFT) {
            this.moveCursor(-1, 0);
        } else if (inputData.keyCode === ROT.KEYS.VK_RIGHT) {
            this.moveCursor(1, 0);
        } else if (inputData.keyCode === ROT.KEYS.VK_UP) {
            this.moveCursor(0, -1);
        } else if (inputData.keyCode === ROT.KEYS.VK_DOWN) {
            this.moveCursor(0, 1);
        } else if (inputData.keyCode === ROT.KEYS.VK_ESCAPE) {
            Game.Screen.playScreen.setSubScreen(undefined);
        } else if (inputData.keyCode === ROT.KEYS.VK_RETURN) {
            this.executeOkFunction();
        }
    }
    Game.refresh();
};

Game.Screen.TargetBasedScreen.prototype.moveCursor = function(dx, dy) {
    // Make sure we stay within bounds.
    this._cursorX = Math.max(0, Math.min(this._cursorX + dx, Game.getScreenWidth()));
    // We have to save the last line for the caption.
    this._cursorY = Math.max(0, Math.min(this._cursorY + dy, Game.getScreenHeight() - 1));
};

Game.Screen.TargetBasedScreen.prototype.executeOkFunction = function() {
    // Switch back to the play screen.
    Game.Screen.playScreen.setSubScreen(undefined);
    // Call the OK function and end the player's turn if it return true.
    if (this._okFunction(this._cursorX, this._cursorY)) {
        this._player.getMap().getEngine().unlock();
    }
};

Game.Screen.lookScreen = new Game.Screen.TargetBasedScreen({
    captionFunction: function(x, y) {
        var map = this._player.getMap();
        // If the tile is explored, we can give a better caption
        if (map.isExplored(x, y)) {
            // If the tile isn't explored, we have to check if we can actually see it before testing if there's an entity or item.
            if (this._visibleCells[x + ',' + y]) {
                var items = map.getItemsAt(x, y);
                // If we have items, we want to render the top most item
                if (items) {
                    var item = items[items.length - 1];
                    return (item.getRepresentation() + ' - ' + item.describeA(true) + '. ' + item.getDescription() + (item.hasMixin('Equippable') ? item.getPowerDescription() : ''));
                // Else check if there's an entity
                } else if (map.getEntityAt(x, y)) {
                    var entity = map.getEntityAt(x, y);
                    let hpSuffix = '';
                    if (entity.hasMixin('Destructible') && !entity.isNotMonster()){
                        hpSuffix = ' HP: ' + entity.getHP() + '/' + entity.getMaxHP();
                    }
                    return (entity.getRepresentation() + ' - ' + entity.describeA(true) + '. ' + entity.getDescription() + hpSuffix);
                }
            }
            // If there was no entity/item or the tile wasn't visible, then use
            // the tile information.
            return map.getTile(x, y).getRepresentation() + " - " + map.getTile(x, y).getDescription();

        } else {
            // If the tile is not explored, show the null tile description.
            return Game.Tile.nullTile.getRepresentation() + " - " + Game.Tile.nullTile.getDescription();
        }
    }
});

let lineCaptionFunction = function(x, y) {
    let map = this._player.getMap();
    // If the tile is explored, we can give a better capton
    if (map.isExplored(x, y)) {
        // If the tile isn't explored, we have to check if we can actually see it before testing if there's an entity or item.
        if (this._visibleCells[x + ',' + y]) {
            let items = map.getItemsAt(x, y);
            // If we have items, we want to render the top most item
            if (items) {
                let item = items[items.length - 1];
                return (item.getRepresentation() + ' - ' + item.describeA(true) + '. ' + item.getDescription());
            // Else check if there's an entity
            } else if (map.getEntityAt(x, y)) {
                let entity = map.getEntityAt(x, y);
                return (entity.getRepresentation() + ' - ' + entity.describeA(true) + '. ' + entity.getDescription());
            }
        }
        // If there was no entity/item or the tile wasn't visible, then use
        // the tile information.
        return map.getTile(x, y).getRepresentation() + " - " + map.getTile(x, y).getDescription();

    } else {
        // If the tile is not explored, show the null tile description.
        return Game.Tile.nullTile.getRepresentation() + " - " + Game.Tile.nullTile.getDescription();
    }
}

Game.Screen.throwAtScreen = new Game.Screen.TargetBasedScreen({
    captionFunction: lineCaptionFunction,
    ok: function() {  
        this._player.throwItem(this._item, this._cursorX, this._cursorY, this._key);
        return true;
    }
});

Game.Screen.aimAtScreen = new Game.Screen.TargetBasedScreen({
    captionFunction: lineCaptionFunction,
    ok: function() {    
        this._player.shoot(this._item, this._cursorX, this._cursorY, this._key);
        return true;
    }
});

Game.Screen.ItemScreen = function(template) {
    // Set up based on the template
    this._caption = template['caption'];
    this._okFunction = template['ok'];
};

Game.Screen.ItemScreen.prototype.setup = function(player, item, fromScreen, key) {
    this._player = player;
    this._item = item;
    this._priorSubscreen = fromScreen;
    this._key = key;
};

Game.Screen.ItemScreen.prototype.render = function(display) {
    // Render the caption in the top row
    display.drawText(0, 0, this._caption);
    display.drawText(0, 1, this._item.describe());
    var rowCount = 0;
    //open an item modal with:
    if (this._item.hasMixin('Equippable') && this._item.isHeadible()){
        if (this._item.getPowerDescription() !== ''){
            display.drawText(0,rowCount + 2, "%c{"+this._item.getForeground()+"}" + this._item.getPowerDescription());
            rowCount += 1;
        }
    }

    if(this._item.hasMixin('Edible') || (this._item.hasMixin('Usable') && this._item.getUses() > 0) ){
        display.drawText(0, rowCount + 3, "%c{yellow}A%c{white}pply");
        rowCount += 1;
    }
    if(this._item.hasMixin('Equippable')){
        display.drawText(0, rowCount + 3, "%c{yellow}E%c{white}quip");
        //conditionally show unequip for equipped items
        if (this._player.checkIfEquipped(this._item)){
            display.drawText(0, rowCount + 3 + 1, "%c{yellow}U%c{white}nequip");
            rowCount += 1;
        }
        rowCount += 1;
    }
    if(this._item.hasMixin('Throwable')){
        display.drawText(0, rowCount + 3, "%c{yellow}T%c{white}hrow");
        rowCount += 1;
    }
    display.drawText(0,rowCount + 3, "%c{yellow}D%c{white}rop");
    rowCount += 1;
};

Game.Screen.ItemScreen.prototype.executeOkFunction = function() {
    // Switch back to the prior screen.
    Game.Screen.playScreen.setSubScreen(undefined);
    // Call the OK function and end the player's turn if it return true.
    if (this._okFunction()) {
        this._player.getMap().getEngine().unlock();
    }
};

Game.Screen.ItemScreen.prototype.handleInput = function(inputType, inputData) {
    if (inputType === 'keydown') {
        // If the user hit escape, hit enter and can't select an item, or hit
        // enter without any items selected, simply cancel out
        if (inputData.keyCode === ROT.KEYS.VK_ESCAPE) {
            Game.Screen.playScreen.setSubScreen(this._priorSubscreen);
        // Handle pressing a letter if we can select
        } else if (inputData.keyCode === ROT.KEYS.VK_A) {
            let item = this._item;
            if(item.hasMixin('Edible')){
                Game.sendMessage(this._player, "You drink %s.", [item.describeThe()]);
                item.eat(this._player);
                this._player.removeItem(this._key);
                this.executeOkFunction();
            } else if (item.hasMixin('Usable') && item.getUses() > 0){
                Game.Screen.aimAtScreen.setup(this._player, this._player.getX(), this._player.getY(), item, this._key);
                Game.Screen.playScreen.setSubScreen(Game.Screen.aimAtScreen);    
                // if we go to aim screen, it handles okaying itself and closing out.       
            } else if (item.hasMixin('Usable') && item.getUses() === 0){
                Game.sendMessage(this._player, "%c{#F61067}The %s is out of charges.", [item.describe()]); 
                // if we go to aim screen, it handles okaying itself and closing out.
            }
        } else if (inputData.keyCode === ROT.KEYS.VK_D){
            this._player.dropItem(this._key);
            this.executeOkFunction();
        } else if (inputData.keyCode === ROT.KEYS.VK_E){
            if(this._item.hasMixin('Equippable')){
                if (this._item.isWieldable()){
                    this._player.wield(this._item);
                    Game.sendMessage(this._player, "You are wielding %s.", [this._item.describeA()]);
                } else if (this._item.isWearable()){
                    this._player.wear(this._item);
                    Game.sendMessage(this._player, "You are wearing %s.", [this._item.describeA()]);
                } else if (this._item.isHeadible()){
                    this._player.wearHead(this._item);
                    Game.sendMessage(this._player, "You are wearing %s.", [this._item.describeA()]);
                }
                this.executeOkFunction();
            }
        } else if (inputData.keyCode === ROT.KEYS.VK_U){
            if(this._item.hasMixin('Equippable')){
                if (this._item.isWieldable() && this._player.checkIfEquipped(this._item)){
                    this._player.unequip(this._item);
                    Game.sendMessage(this._player, "You are no longer wielding %s.", [this._item.describeA()]);
                    this.executeOkFunction();
                } else if (this._item.isWearable() && this._player.checkIfEquipped(this._item)){
                    this._player.unequip(this._item);
                    Game.sendMessage(this._player, "You are no longer wearing %s.", [this._item.describeA()]);
                    this.executeOkFunction();
                } else if (this._item.isHeadible() && this._player.checkIfEquipped(this._item)){
                    this._player.unequip(this._item);
                    Game.sendMessage(this._player, "You are not longe wearing %s.", [this._item.describeA()]);
                    this.executeOkFunction();
                }
            }
        } else if (inputData.keyCode === ROT.KEYS.VK_T){
            Game.Screen.throwAtScreen.setup(this._player, this._player.getX(), this._player.getY(), this._item, this._key);
            Game.Screen.playScreen.setSubScreen(Game.Screen.throwAtScreen);
            // if we go to throw screen, it handles okaying itself and closing out.
        }
    }
};

Game.Screen.itemScreenGeneric = new Game.Screen.ItemScreen({
    caption: '%c{#CCCCCC}WHAT DO YOU WANT TO DO WITH THIS ITEM?',
    ok: function() {
        return true;
    }
});