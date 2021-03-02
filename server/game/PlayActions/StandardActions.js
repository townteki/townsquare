const PutIntoPlayCardAction = require('./PutIntoPlayCardAction');
const ShoppinCardAction = require('./ShoppinCardAction');

var StandardActions = {};

var defaultProperties = {
    playType: 'ability', 
    sourceType: 'ability', 
    target: ''
};

StandardActions.shoppin = function(target) {
    return new ShoppinCardAction(target);
};

StandardActions.putIntoPlay = function(properties, callback) {
    return new PutIntoPlayCardAction(properties, callback);
};

StandardActions.putIntoPlayAtLocation = function(target, callback) {
    return new PutIntoPlayCardAction(Object.assign(defaultProperties, { target: target }), callback);
};

StandardActions.putIntoPlayWithReduction = function(reduceAmount, callback) {
    return new PutIntoPlayCardAction(Object.assign(defaultProperties, { reduceAmount: reduceAmount }), callback);
};

module.exports = StandardActions;
