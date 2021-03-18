const TraitTriggeredAbility = require('./traittriggeredability.js');

class CardTraitReaction extends TraitTriggeredAbility {
    constructor(game, card, properties) {
        super(game, card, 'traitreaction', properties);
    }
}

module.exports = CardTraitReaction;
