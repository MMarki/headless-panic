var Game =  {
	_display: null,
    _currentScreen: null,
    _screenWidth: 72,
    _screenHeight: 24,
    _level: 1,
	init: function() {
        // Any necessary initialization will go here.
        this._display = new ROT.Display({width: this._screenWidth + 24, height: this._screenHeight + 5, fontSize: 24, fontFamily: "'Ubuntu Mono', monospace", spacing: 1.2});
        
	    // Create a helper function for binding to an event
	    // and making it send it to the screen
	    let game = this; // So that we don't lose this
	    let bindEventToScreen = function(event) {
            window.addEventListener(event, function(e) {
                // When an event is received, send it to the
                // screen if there is one
                if (game._currentScreen !== null) {
                    // Send the event type and data to the screen
                    game._currentScreen.handleInput(event, e, true);
                }
            });
        }
	    // Bind keyboard input events
	    bindEventToScreen('keydown');
	    bindEventToScreen('keypress');
    },
    refresh: function() {
        // Clear the screen
        this._display.clear();
        // Render the screen
        this._currentScreen.render(this._display);
    },
	getDisplay: function() {
		return this._display;
    },
    getScreenWidth: function(){
        return this._screenWidth;
    },
    getScreenHeight: function(){
        return this._screenHeight;
    },
    getLevel: function(){
        return this._level;
    },
    incrementLevel: function(){
        this._level += 1;
    },
	switchScreen: function(screen) {
	    // If we had a screen before, notify it that we exited
	    if (this._currentScreen !== null) {
	        this._currentScreen.exit();
	    }
	    // Clear the display
	    this.getDisplay().clear();
	    // Update our current screen, notify it we entered
	    // and then render it
	    this._currentScreen = screen;
	    if (!this._currentScreen !== null) {
	        this._currentScreen.enter();
	        this.refresh();
	    }
	}
}

window.onload = function(){
    Game.init();
    let container = Game.getDisplay().getContainer();
    document.documentElement.appendChild(container);
    //Load the start screen
    Game.switchScreen(Game.Screen.startScreen);
}