const TraitTriggeredAbility = require('./traittriggeredability.js');

class CardTraitBeforeReaction extends TraitTriggeredAbility {
    constructor(game, card, properties) {
        super(game, card, 'traitbeforereaction', properties);
    }
}

module.exports = CardTraitBeforeReaction;
