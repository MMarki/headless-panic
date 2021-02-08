Function.prototype.extend = function(parent) {
    this.prototype=Object.create(parent.prototype);
    this.prototype.constructor = this;
    return this;
};

Game.Utilities = {};

Game.Utilities.randomRange = function(min, max){
        return Math.random() * (max - min) + min;
}

Game.randomize = function(array) {
    let currentIndex = array.length, temporaryValue, randomIndex;
  
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
  
      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
  
    return array;
}

Game.pickRandomElement = function(array){
  let element =  array[Math.floor(Math.random() * array.length)];
  return element;
}

