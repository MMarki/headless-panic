Game.Effect = function(duration = 10, name = "unknown"){
    this._duration = duration;
    this._name = name;
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
    } else if (name === 'blind' || name === 'paralyzed'){
        return '#EE22EE';
    } else {
        return '#4D6CFA';
    }
}