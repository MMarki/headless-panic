Game.Screen = {};

// Define our initial start screen
Game.Screen.startScreen = {
    enter: function() {console.log("Entered start screen."); },
    exit: function() { console.log("Exited start screen."); },
    render: function(display) {
        // Render our prompt to the screen
        display.drawText(1,1, "%c{yellow}Headless Panic");
        display.drawText(1,2, "Press [Enter] to start!");
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
        var tiles = new Game.Builder(width,height).getTiles()
        this._player = new Game.Entity(Game.PlayerTemplate);
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
        var visibleCells = {}
        // Store this._map and player's z to prevent losing it in callbacks
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
        // Iterate through all visible map cells
        for (var x = 0; x < this._map.getWidth(); x++) {
            for (var y = 0; y < this._map.getHeight(); y++) {
                if (visibleCells[x + "," + y]){
                    // Fetch the glyph for the tile and render it to the screen
                    var tile = this._map.getTile(x, y);
                    display.draw(x, y,
                        tile.getChar(), 
                        tile.getForeground(), 
                        tile.getBackground());
                }
            }
        }
        // Render the explored map cells
        for (var x = 0; x < this._map.getWidth(); x++) {
            for (var y = 0; y < this._map.getHeight(); y++) {
                if (map.isExplored(x, y)) {
                    // Fetch the glyph for the tile and render it to the screen
                    // at the offset position.
                    var glyph = this._map.getTile(x, y);
                    var foreground = glyph.getForeground();
                    var tile = this._map.getTile(x, y);
                    // If we are at a cell that is in the field of vision, we need
                    // to check if there are items or entities.
                    if (visibleCells[x + ',' + y]) {
                        // Check for items first, since we want to draw entities
                        // over items.
                        var items = map.getItemsAt(x, y);
                        // If we have items, we want to render the top most item
                        if (items) {
                            glyph = items[items.length - 1];
                        }
                        // Check if we have an entity at the position
                        if (map.getEntityAt(x, y)) {
                            glyph = map.getEntityAt(x, y);
                        }
                        // Update the foreground color in case our glyph changed
                        foreground = glyph.getForeground();
                    } else {
                        // Since the tile was previously explored but is not visible,
                        // we want to change the foreground color todark gray.
                        foreground = 'darkGray';
                    }
                    display.draw(
                        x,
                        y,
                        glyph.getChar(), 
                        foreground, 
                        tile.getBackground());
                }
            }
        }
        // Render the entities
        var entities = this._map.getEntities();
        for (var key in entities) {
            var entity = entities[key];
            if (visibleCells[entity.getX() + ',' + entity.getY()]) {
                display.draw(
                    entity.getX(), 
                    entity.getY(),    
                    entity.getChar(), 
                    entity.getForeground(), 
                    entity.getBackground()
                );
            }
        }
        // Get the messages in the player's queue and render them
        var messages = this._player.getMessages();
        var messageY = 0;
        for (var i = 0; i < messages.length; i++) {
            // Draw each message, adding the number of lines
            messageY += display.drawText(
                0, 
                messageY,
                '%c{white}%b{black}' + messages[i]
            );
        }
        // Render UI 
        display.drawText(0, screenHeight, "%c{yellow}I%c{}nventory  %c{yellow}T%c{}hrow  %c{yellow}E%c{}quip  %c{yellow}U%c{}se");

        var you = '%c{white}%b{black}';
        you += "@: You";
        display.drawText(screenWidth + 1, 0, you);

        var playerHealth = this._player.getHp()/this._player.getMaxHp()
        var healthUIColor = (playerHealth > 0.66) ? "%c{white}" : ((playerHealth > 0.33) ? "%c{yellow}" : "%c{red}");
        var healthString = "%c{white}%b{black}HP: " + healthUIColor + this._player.getHp() + "/" + this._player.getMaxHp();
        display.drawText(screenWidth + 1, 1, healthString);

        var currentHead = this._player.getHead();
        if (currentHead !== null){
            display.drawText(screenWidth + 1, 2, "HEAD: " +  "%c{" + currentHead._foreground + "}"+ currentHead._name);
            var numberOfHeadHits = currentHead._headHits;
            for (var h = 0; h < numberOfHeadHits; h++){
                display.drawText(screenWidth + 1 + 2 * h, 3, "\u2665 ");
            }
        } else {
            display.drawText(screenWidth + 1, 2, "HEAD: " + "%c{red}NONE");
        }
        
        
        display.drawText(screenWidth + 1, 5, "ARMOR: +" + this._player.getDefenseValue());
        display.drawText(screenWidth + 1, 6, "ATK: +" + this._player.getAttackValue());
        display.drawText(screenWidth + 1, 7, "GOLD: 0" );
        display.drawText(screenWidth + 1, 8, "LVL: Cellars " + Game.getLevel() );
    },
    handleInput: function(inputType, inputData) {
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
            // If enter is pressed, go to the win screen
            // If escape is pressed, go to lose screen
            if (inputData.keyCode === ROT.KEYS.VK_RETURN) {
                Game.switchScreen(Game.Screen.winScreen);
            } else if (inputData.keyCode === ROT.KEYS.VK_ESCAPE) {
                Game.switchScreen(Game.Screen.loseScreen);
            } 
            // Movement
            if (inputData.keyCode === ROT.KEYS.VK_LEFT) {
                this.move(-1, 0);
                this.handleItemPickup()
                this.goDownStairs();
            } else if (inputData.keyCode === ROT.KEYS.VK_RIGHT) {
                this.move(1, 0);
                this.handleItemPickup()
                this.goDownStairs();
            } else if (inputData.keyCode === ROT.KEYS.VK_UP) {
                this.move(0, -1);
                this.handleItemPickup()
                this.goDownStairs();
            } else if (inputData.keyCode === ROT.KEYS.VK_DOWN) {
                this.move(0, 1);
                this.handleItemPickup()
                this.goDownStairs();
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
            } 
            else if (inputData.keyCode === ROT.KEYS.VK_D) {
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
            }  else if (inputData.keyCode === ROT.KEYS.VK_U) {
                // Show the eat screen
                if (Game.Screen.eatScreen.setup(this._player, this._player.getItems())) {
                    this.setSubScreen(Game.Screen.eatScreen);
                } else {
                    Game.sendMessage(this._player, "You have nothing to eat!");
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
            } else {
                // Not a valid key
                return;
            }
            // Unlock the engine
            this._map.getEngine().unlock();
        }    
    },
    setGameEnded: function(gameEnded) {
        this._gameEnded = gameEnded;
    },
    move: function(dX, dY) {
        var newX = this._player.getX() + dX;
        var newY = this._player.getY() + dY;
        // Try to move to the new cell
        this._player.tryMove(newX, newY, this._map);
    },
    setSubScreen: function(subScreen) {
        this._subScreen = subScreen;
        // Refresh screen on changing the subscreen
        Game.refresh();
    },
    goDownStairs(){
        var playerX = this._player.getX();
        var playerY = this._player.getY();
        var tile = this._map.getTile(playerX, playerY);
        if (tile === Game.Tile.stairsDownTile){
            var width = Game._screenWidth;
            var height = Game._screenHeight;
            // Create our map from tiles and player
            var tiles = new Game.Builder(width,height).getTiles()
            //pass the current player and the new tiles in
            this._map = new Game.Map(tiles, this._player, this._player.getItems());
            // Start the map's engine
            this._map.getEngine().start();
            Game.incrementLevel();
            Game.sendMessage(this._player, "You go downstairs.");
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
    enter: function() {    console.log("Entered lose screen."); },
    exit: function() { console.log("Exited lose screen."); },
    render: function(display) {
        // Render our prompt to the screen
        for (var i = 0; i < 22; i++) {
            display.drawText(2, i + 1, "%b{red}You lose! :(");
        }
    },
    handleInput: function(inputType, inputData) {
        // Nothing to do here      
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
    // Whether a 'no item' option should appear.
    this._hasNoItemOption = template['hasNoItemOption'];
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
    // Render the no item row if enabled
    if (this._hasNoItemOption) {
        display.drawText(0, 1, '0 - no item');
    }
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
            var suffix = '';
            if (this._items[i] === this._player.getArmor()) {
                suffix = ' (wearing)';
            } else if (this._items[i] === this._player.getWeapon()) {
                suffix = ' (wielding)';
            } else if (this._items[i] === this._player.getHead()) {
                suffix = ' (wearing)';
            }
            // Render at the correct row and add 2.
            display.drawText(0, 2 + row,  letter + ' ' + selectionState + ' ' + this._items[i].describe() + suffix);
            row++;
        }
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
    // Call the OK function and end the player's turn if it return true.
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
        // Handle pressing zero when 'no item' selection is enabled
        } else if (this._canSelectItem && this._hasNoItemOption && inputData.keyCode === ROT.KEYS.VK_0) {
            this._selectedIndices = {};
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
                    this._selectedIndices[index] = true;
                    this.executeOkFunction();
                }
            }
        }
    }
};

Game.Screen.eatScreen = new Game.Screen.ItemListScreen({
    caption: 'Choose the item you wish to eat',
    canSelect: true,
    canSelectMultipleItems: false,
    isAcceptable: function(item) {
        return item && item.hasMixin('Edible');
    },
    ok: function(selectedItems) {
        // Eat the item
        var key = Object.keys(selectedItems)[0];
        var item = selectedItems[key];
        Game.sendMessage(this._player, "You eat %s.", [item.describeThe()]);
        item.eat(this._player);
        this._player.removeItem(key);
        return true;
    }
});

Game.Screen.equipScreen = new Game.Screen.ItemListScreen({
    caption: 'Choose the item you wish to equip',
    canSelect: true,
    canSelectMultipleItems: false,
    hasNoItemOption: true,
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
            // Make sure to unequip the item first in case it is the armor.
            var item = selectedItems[keys[0]];
            if (item.isWieldable()){
                this._player.wield(item);
                Game.sendMessage(this._player, "You are wielding %s.", [item.describeA()]);
            } else if (item.isWearable()){
                this._player.wear(item);
                Game.sendMessage(this._player, "You are wearing %s.", [item.describeA()]);
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
    canSelect: false
});

Game.Screen.pickupScreen = new Game.Screen.ItemListScreen({
    caption: 'Choose the items you wish to pickup',
    canSelect: true,
    canSelectMultipleItems: true,
    ok: function(selectedItems) {
        // Try to pick up all items, messaging the player if they couldn't all be
        // picked up.
        if (!this._player.pickupItems(Object.keys(selectedItems))) {
            Game.sendMessage(this._player, "Your inventory is full! Not all items were picked up.");
        }
        return true;
    }
});

Game.Screen.dropScreen = new Game.Screen.ItemListScreen({
    caption: 'Choose the item you wish to drop',
    canSelect: true,
    canSelectMultipleItems: false,
    ok: function(selectedItems) {
        // Drop the selected item
        this._player.dropItem(Object.keys(selectedItems)[0]);
        return true;
    }
});