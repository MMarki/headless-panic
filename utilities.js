Function.prototype.extend = function(parent) {
    this.prototype=Object.create(parent.prototype);
    this.prototype.constructor = this;
    return this;
};

Game.Utilities = {};

Game.Utilities.randomRange = function(min, max){
        return Math.random() * (max - min) + min;
}