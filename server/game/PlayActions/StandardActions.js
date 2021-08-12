const PutIntoPlayCardAction = require('./PutIntoPlayCardAction');
const ShoppinCardAction = require('./ShoppinCardAction');

var StandardActions = {};

var defaultProperties = {
    playType: 'ability', 
    abilitySourceType: 'ability', 
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

StandardActions.putIntoPlayWithReduction = function(reduceAmount, minimum, callback) {
    return new PutIntoPlayCardAction(Object.assign(defaultProperties, { reduceAmount, minimum }), callback);
};

module.exports = StandardActions;
