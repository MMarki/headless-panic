Game.Effect = function(duration, name){
    this._duration = duration || 10;
    this._name = name || "unknown";
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