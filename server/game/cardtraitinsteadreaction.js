const TraitTriggeredAbility = require('./traittriggeredability.js');

class CardTraitInsteadReaction extends TraitTriggeredAbility {
    constructor(game, card, properties) {
        super(game, card, 'traitinsteadreaction', properties);
    }
}

module.exports = CardTraitInsteadReaction;
