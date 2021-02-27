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

StandardActions.putIntoPlay = function(properties) {
    return new PutIntoPlayCardAction(properties);
};

StandardActions.putIntoPlayAtLocation = function(target) {
    return new PutIntoPlayCardAction(Object.assign(defaultProperties, { target: target }));
};

StandardActions.putIntoPlayWithReduction = function(reduceAmount) {
    return new PutIntoPlayCardAction(Object.assign(defaultProperties, { reduceAmount: reduceAmount }));
};

module.exports = StandardActions;
