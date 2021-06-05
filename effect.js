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
        return Game.Colors.poisonColor;
    } else if (name === 'burning'){
        return Game.Colors.burningColor;
    } else if (name === 'blind' || name === 'paralyzed'){
        return Game.Colors.blindColor;
    } else if (name === 'vulnerable' || name === 'slowed'){
        return Game.Colors.lichColor;
    } else if (name === 'invisible'){
       return Game.Colors.invisibleColor;
    } else {
        return Game.Colors.effectDefault;
    }
}