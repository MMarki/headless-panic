Game.Screen = {};

// Define our initial start screen
Game.Screen.startScreen = {
    enter: function() {console.log("Entered start screen."); },
    exit: function() { console.log("Exited start screen."); },
    render: function(display) {
        // Render our prompt to the screen
        display.drawText(1,1, "%c{yellow}Headless Panic");
        display.drawText(1,3, "%c{white}Betrayed. Beheaded. Thrown into the ancient cellars below the castle.");
        display.drawText(1,5, "%c{white}Press %c{yellow}[Enter] %c{white}to start!");
    },
    handleInput: function(inputType, inputData) {
        // When [Enter] is pressed, go to the play screen
        if (inputType === 'keydown') {
            if (inputData.keyCode === ROT.KEYS.VK_RETURN) {
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
    enter: function() {  
        var width = Game._screenWidth;
        var height = Game._screenHeight;
        // Create our map from tiles and player
        var tiles = new Game.Builder(width,height, Game.getLevel()).getTiles()
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
        var wand = Game.ItemRepository.create('wand of blinking');
        this._player.addItem(wand);
        var test = Game.ItemRepository.create('knowledge potion');
        this._player.addItem(test);
        //Create map
        this._map = new Game.Map(tiles, this._player);
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
            display.drawText(screenWidth + 1, 2, "%c{white}HEAD: " +  "%c{" + currentHead._foreground + "}"+ currentHead._name);
            var numberOfHeadHits = currentHead._headHits;
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
        
        var strengthGap = 0;
        var strengthModifier = 0;
        var strengthValue = this._player.getStrengthValue();
        var attackValue = this._player.getAttackValue();
        var defenseValue = this._player.getDefenseValue();
        if (this._player.getWeapon() !== null){
            strengthGap = strengthValue - this._player.getWeapon()._strengthRequirement
            if (strengthGap <  0){
                strengthModifier = 4 * strengthGap;
            } else if (strengthGap > 0){
                strengthModifier =  strengthGap;
            }
        }

        display.drawText(screenWidth + 1, 5, "%c{white}ARMR: +" + defenseValue);
        display.drawText(screenWidth + 1, 6, "%c{white}ATTK: +" + (attackValue + strengthModifier));
        display.drawText(screenWidth + 1, 7, "%c{white}STRN: " + strengthValue);
        if (Game.getLevel() < 4){
            display.drawText(screenWidth + 1, 8, "%c{white}LVL:  " +  ("Cellars " + Game.getLevel()) );
        } else if (Game.getLevel() < 7){
            display.drawText(screenWidth + 1, 8, "%c{white}LVL:  " +  ("Sewers " + (Game.getLevel() - 3)) );
        } else {
            display.drawText(screenWidth + 1, 8, "%c{white}LVL:  " +  ("Caverns " + (Game.getLevel() - 6)) );
        }
        
    },
    handleInput: function(inputType, inputData, invokedManually) {
        // If the game is over, enter will bring the user to the losing screen.
        if (this._gameEnded) {
            if (inputType === 'keydown' && inputData.keyCode === ROT.KEYS.VK_RETURN) {
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
        if (inputType === 'keydown') {
            // Movement
            if (inputData.keyCode === ROT.KEYS.VK_LEFT) {
                if (!this._player.hasEffect('paralyzed')){
                    this.move(-1, 0);
                    this.handleItemPickup()
                    this.goDownStairs();
                } else {
                    Game.sendMessage(this._player, "You are paralyzed!");
                }
            } else if (inputData.keyCode === ROT.KEYS.VK_RIGHT) {
                if (!this._player.hasEffect('paralyzed')){
                    this.move(1, 0);
                    this.handleItemPickup()
                    this.goDownStairs();
                } else {
                    Game.sendMessage(this._player, "You are paralyzed!");
                }
            } else if (inputData.keyCode === ROT.KEYS.VK_UP) {
                if (!this._player.hasEffect('paralyzed')){
                    this.move(0, -1);
                    this.handleItemPickup()
                    this.goDownStairs();
                } else {
                    Game.sendMessage(this._player, "You are paralyzed!");
                }
            } else if (inputData.keyCode === ROT.KEYS.VK_DOWN) {
                if (!this._player.hasEffect('paralyzed')){
                    this.move(0, 1);
                    this.handleItemPickup()
                    this.goDownStairs();
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
                if (player._pathingTarget){
                    if(map.isExplored(player._pathingTarget.x, player._pathingTarget.y)){
                        player._pathingTarget = null;
                    }
                }

                // Find an unexplored square
                if (player._pathingTarget === null){
                    if (invokedManually === false){
                        //we've hit our target in an auto-loop. Break out of the recursive function
                        return;
                    }
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
                        player._pathingTarget = target;
                        console.log(target);
                    }
                }

                if (!noMoreUnexplored){
                    let path = new ROT.Path.AStar(player._pathingTarget.x, player._pathingTarget.y, function(x, y) {
                        let tile = map.getTile(x, y);
                        return tile.isWalkable() && !tile._isHazard && tile !== Game.Tile.stairsDownTile;
                    }, {topology: 4});
                    console.log(path);
                    
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
                        player._pathingTarget = null;
                    }
                } else {
                    player._pathingTarget = null;
                }
            }
            // Unlock the engine
            this._map.getEngine().unlock();
            if (this._player._pathingTarget){
                let currentHead = this._player.getHead();
                if (currentHead !== null && inputData.keyCode === ROT.KEYS.VK_X){
                    let artificialInputData = {}
                    artificialInputData.keyCode = ROT.KEYS.VK_X
                    Game.sleep(100).then(() => { this.handleInput('keydown', artificialInputData, false) });
                }
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
        // Try to move to the new cell
        this._player.tryMove(newX, newY);
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
            var width = Game._screenWidth;
            var height = Game._screenHeight;
            // Create our map from tiles and player
            Game.incrementLevel();
            var tiles = new Game.Builder(width,height, Game.getLevel()).getTiles()
            //pass the current player and the new tiles in
            this._map = new Game.Map(tiles, this._player, this._player.getItems());
            // Start the map's engine
            this._map.getEngine().start();
            if (playerHasKey){
                Game.sendMessage(this._player, "You use the key on the trapdoor. You go down the stairs. They crumble to dust behind you.");
                for (let i = 0; i < items.length; i ++){
                    if (items[i] !== undefined && items[i] !== null){
                        if (items[i].describe() === 'key'){
                            items[i] = null;
                        }
                    }
                }
            } else {
                Game.sendMessage(this._player, "You go down the stairs. They crumble to dust behind you.");
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
                Game.sendMessage(this._player, "You pick up %s.", [item.describeA()]);
            } else {
                Game.sendMessage(this._player, "Your inventory is full! Nothing was picked up.");
            }
        } else {
            // Show the pickup screen if there are any items
            Game.Screen.pickupScreen.setup(this._player, items);
            this.setSubScreen(Game.Screen.pickupScreen);
            return;
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
                    var glyph = this._map.getTile(x, y);
                    var foreground = glyph.getForeground();
                    var tile = this._map.getTile(x, y);
                    var background = tile.getBackground();
                    // If we are at a cell that is in the field of vision, we need
                    // to check if there are items or entities.
                    if (visibleCells[x + ',' + y]) {
                        // Check for items first to draw over the floor
                        var items = map.getItemsAt(x, y);
                        // If we have items, we want to render the top most item
                        if (items) {
                            glyph = items[items.length - 1];
                            display.drawText(screenWidth + 1, 10 + j , '%c{' + glyph._foreground + '}' + glyph._char + ':  ' + glyph._name);
                            j++;
                        }
                        // Update the foreground color in case our glyph changed
                        foreground = glyph.getForeground();
                    } else {
                        var items = map.getItemsAt(x, y);
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
            var entities = this._map.getEntities();
            var visibleEntities = [];
            //var screenWidth = Game.getScreenWidth();

            for (var key in entities) {
                var entity = entities[key];
                if (visibleCells[entity.getX() + ',' + entity.getY()] || (this._player.hasEffect('knowledgeable') && entity._notMonster == false)) {
                    display.draw(entity.getX(), entity.getY(), entity.getChar(), entity.getForeground(), entity.getBackground());
                    if (!entity.hasMixin('PlayerActor') && entity._notMonster === false){
                        visibleEntities.push(entity);
                    }
                }
            }
            
            for (var i=0; i < visibleEntities.length; i++){
                var visibleEntity = visibleEntities[i]
                display.drawText(screenWidth + 1, 10 + 2*i + i + j , '%c{' + visibleEntity.getForeground() + '}' + visibleEntity.getChar() + ':  ' + visibleEntity.getName());
                display.drawText(screenWidth + 1, 11 + 2*i + i + j, 'HP: ' + visibleEntity.getHP() + '/' + visibleEntity.getMaxHP());
            
                var effectsList = visibleEntity.getEffects();
                var effectsString = '';
                for (effect of effectsList){
                    var effectsString = effectsString + '%c{' + effect._color + '}' + effect.getName() + ' ';
                }
                display.drawText(screenWidth + 1, 12 + 2*i + i + j, effectsString);
            }
        }
    }
}

// Define our winning screen
Game.Screen.winScreen = {
    enter: function() {    console.log("Entered win screen."); },
    exit: function() { console.log("Exited win screen."); },
    render: function(display) {
        // Render our prompt to the screen
        for (var i = 0; i < 22; i++) {
            // Generate random background colors
            var r = Math.round(Math.random() * 255);
            var g = Math.round(Math.random() * 255);
            var b = Math.round(Math.random() * 255);
            var background = ROT.Color.toRGB([r, g, b]);
            display.drawText(2, i + 1, "%b{" + background + "}You win!");
        }
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
        display.drawText(2, 1, "You died.");
        display.drawText(2, 3, this.chooseHint());
        display.drawText(2, 5, "%c{yellow}Refresh your browser tab to restart.");
    },
    handleInput: function(inputType, inputData) {
        // Nothing to do here      
    },
    chooseHint: function(){
        var hintList = [
            "Avoiding fights is as good as winning them, especially if an enemy doesn't have a head to drop.",
            "Wielding a weapon with insufficient strength greatly reduces chance to hit and max hit.",
            "Wielding a weapon with excess strength increases chance to hit and max hit.",
            "Wearing an enemy's head gives you one of their powers.",
            "The further you throw a weapon, the less likely it is to hit an enemy.",
            "Press X to eXplore automatically. It's not as smart as manual control, put it's much faster."
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
    var letters = 'abcdefghijklmnopqrstuvwxyz';
    // Render the caption in the top row
    display.drawText(0, 0, this._caption);
    var row = 0;
    for (var i = 0; i < this._items.length; i++) {
        // If we have an item, we want to render it.
        if (this._items[i]) {
            // Get the letter matching the item's index
            var letter = letters.substring(i, i + 1);
            // If we have selected an item, show a +, else show a dash between
            // the letter and the item's name.
            var selectionState = (this._canSelectItem && this._canSelectMultipleItems &&
                this._selectedIndices[i]) ? '+' : '-';
            // Render at the correct row and add 2.
            // Check if the item is worn or wielded
            var glyph = this._items[i].getChar()
            var foreground = this._items[i].getForeground(); 
            var prefix = '%c{white}';
            var suffix = '';
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
            // Render at the correct row and add 2.
            display.drawText(0, 2 + row,  letter + ' ' + selectionState + ' ' + '%c{'+ foreground +'}' + glyph + ' ' + prefix + this._items[i].describe() + suffix);
            row++;
        } 
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
            return true;
        } else if (item.hasMixin('Usable')){
            Game.Screen.aimAtScreen.setup(this._player, this._player.getX(), this._player.getY(), item, key);
            Game.Screen.playScreen.setSubScreen(Game.Screen.aimAtScreen);            
        }
        
    }
});

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

//This needs its own OK function
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
    // Store current cursor position
    this._cursorX = this._startX;
    this._cursorY = this._startY;
    // Cache the FOV
    var visibleCells = {};
    this._player.getMap().getFov().compute(
        this._player.getX(), this._player.getY(), 
        this._player.getSightRadius(), 
        function(x, y, radius, visibility) {
            visibleCells[x + "," + y] = true;
        });
    this._visibleCells = visibleCells;
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
                    return (item.getRepresentation() + ' - ' + item.describeA(true) + '. ' + item.getDescription());
                // Else check if there's an entity
                } else if (map.getEntityAt(x, y)) {
                    var entity = map.getEntityAt(x, y);
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
    if(this._item.hasMixin('Edible')){
        display.drawText(0, rowCount + 3, "%c{yellow}A%c{white}pply");
        rowCount += 1;
    }
    if(this._item.hasMixin('Equippable')){
        display.drawText(0, rowCount + 3, "%c{yellow}E%c{white}quip");
        rowCount += 1;
    }
    if(this._item.hasMixin('Throwable')){
        display.drawText(0, rowCount + 3, "%c{yellow}T%c{white}hrow");
        rowCount += 1;
    }
    display.drawText(0,rowCount + 3, "%c{yellow}D%c{white}rop");
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
            Game.sendMessage(this._player, "You drink %s.", [this._item.describeThe()]);
            this._item.eat(this._player);
            this._player.removeItem(this._key);
            this.executeOkFunction();
        } else if (inputData.keyCode === ROT.KEYS.VK_D){
            this._player.dropItem(this._key);
            this.executeOkFunction();
        } else if (inputData.keyCode === ROT.KEYS.VK_E){
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
        } else if (inputData.keyCode === ROT.KEYS.VK_T){
            Game.Screen.throwAtScreen.setup(this._player, this._player.getX(), this._player.getY(), this._item, this._key);
            Game.Screen.playScreen.setSubScreen(Game.Screen.throwAtScreen);
            // if we go to throw screen, it handles okaying itself and closing out.
        } else if (inputData.keyCode === ROT.KEYS.VK_U){
            if (this._item.isWieldable()){
                this._player.unwield();
                Game.sendMessage(this._player, "You put away %s.", [this._item.describeThe()]);
            } else if (this._item.isWearable()){
                this._player.unwear();
                Game.sendMessage(this._player, "You take off %s.", [this._item.describeThe()]);
            } else if (this._item.isHeadible()){
                this._player.unHead();
                Game.sendMessage(this._player, "You take off %s.", [this._item.describeThe()]);
            } 
            this.executeOkFunction();
        }
    }
};


Game.Screen.itemScreenGeneric = new Game.Screen.ItemScreen({
    caption: 'What do you want to do with this item?',
    ok: function() {
        return true;
    }
});