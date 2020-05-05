Game.Effect = function(duration, name){
    this._duration = duration || 10;
    this._name = name || "unknown";
    this._color = this.getEffectColor(name);
}

Game.Effect.prototype.getName = function(){
    return this._name;
}

Game.Effect.prototype.isDone = function() {
    return (this._duration < 1);
}

Game.Effect.prototype.update = function() {
    this._duration = this._duration - 1;
}

Game.Effect.prototype.getEffectColor = function(name) {
    if (name === 'poisoned'){
        return '#00EE00';
    } else if (name === 'burning'){
        return '#EE4411';
    } else if (name === 'blind'){
        return '#EE22EE';
    }
}