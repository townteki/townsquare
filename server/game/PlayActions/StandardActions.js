const PlayingTypes = require('../Constants/PlayingTypes');
const PutIntoPlayCardAction = require('./PutIntoPlayCardAction');
const ShoppinCardAction = require('./ShoppinCardAction');

var StandardActions = {};

var defaultProperties = {
    playType: PlayingTypes.Ability, 
    abilitySourceType: 'card', 
    targetLocationUuid: ''
};

StandardActions.shoppin = function(card, targetLocationUuid) {
    const targetProperties = ['goods', 'spell'].includes(card.getType()) ? 
        attTargetProperties(card, targetLocationUuid, PlayingTypes.Shoppin) : undefined;
    return new ShoppinCardAction(targetLocationUuid, targetProperties);
};

StandardActions.putIntoPlay = function(properties, callback) {
    return new PutIntoPlayCardAction(properties, callback);
};

StandardActions.putIntoPlayAtLocation = function(targetLocationUuid, callback) {
    return new PutIntoPlayCardAction(Object.assign(defaultProperties, { targetLocationUuid }), callback);
};

StandardActions.putIntoPlayWithReduction = function(reduceAmount, minimum, callback) {
    return new PutIntoPlayCardAction(Object.assign(defaultProperties, { reduceAmount, minimum }), callback);
};

function attTargetProperties(attachment, targetLocationUuid, playingType) {
    return {
        activePromptTitle: 'Select target for attachment',
        cardCondition: card => card.controller.canAttach(attachment, card, playingType) &&
            (!targetLocationUuid || targetLocationUuid === card.gamelocation)
    };
}

module.exports = StandardActions;
