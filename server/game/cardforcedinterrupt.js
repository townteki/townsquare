const TraitTriggeredAbility = require('./traittriggeredability.js');

class CardForcedInterrupt extends TraitTriggeredAbility {
    constructor(game, card, properties) {
        super(game, card, 'forcedinterrupt', properties);
    }
}

module.exports = CardForcedInterrupt;
