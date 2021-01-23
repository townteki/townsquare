const ForcedTriggeredAbility = require('./forcedtriggeredability.js');

class CardTraitReaction extends ForcedTriggeredAbility {
    constructor(game, card, properties) {
        super(game, card, 'traitreaction', properties);
    }
}

module.exports = CardTraitReaction;
