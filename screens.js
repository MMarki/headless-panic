Game.Screen = {};

// Define our initial start screen
Game.Screen.startScreen = {
    enter: function() {    console.log("Entered start screen."); },
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
    enter: function() {  
        var width = 80;
        var height = 24;
        // Create our map from tiles and player
        var tiles = new Game.Builder(width,height).getTiles()
        this._player = new Game.Entity(Game.PlayerTemplate);
        this._map = new Game.Map(tiles, this._player);
        // Start the map's engine
        this._map.getEngine().start();
     },
    exit: function() { console.log("Exited play screen."); },
    render: function(display) {
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
                    var tile = this._map.getTile(x, y);
                    // The foreground color becomes dark gray if the tile has been
                    // explored but is not visible
                    var foreground = visibleCells[x + ',' + y] ?
                        tile.getForeground() : 'darkGray';
                    display.draw(
                        x,
                        y,
                        tile.getChar(), 
                        foreground, 
                        tile.getBackground());
                }
            }
        }
        // Render the entities
        var entities = this._map.getEntities();
        for (var i = 0; i < entities.length; i++) {
            var entity = entities[i];
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
            console.log("drawing text");
            // Draw each message, adding the number of lines
            messageY += display.drawText(
                0, 
                messageY,
                '%c{white}%b{black}' + messages[i]
            );
        }
        // Render player HP 
        var stats = '%c{white}%b{black}';
        stats += vsprintf('HP: %d/%d ', [this._player.getHp(), this._player.getMaxHp()]);
        display.drawText(0, screenHeight, stats);
    },
    handleInput: function(inputType, inputData) {
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
            } else if (inputData.keyCode === ROT.KEYS.VK_RIGHT) {
                this.move(1, 0);
            } else if (inputData.keyCode === ROT.KEYS.VK_UP) {
                this.move(0, -1);
            } else if (inputData.keyCode === ROT.KEYS.VK_DOWN) {
                this.move(0, 1);
            }
            // Unlock the engine
            this._map.getEngine().unlock();
        }    
    },
    move: function(dX, dY) {
        var newX = this._player.getX() + dX;
        var newY = this._player.getY() + dY;
        // Try to move to the new cell
        this._player.tryMove(newX, newY, this._map);
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