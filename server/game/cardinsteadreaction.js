const PromptedTriggeredAbility = require('./promptedtriggeredability.js');

class CardInsteadReaction extends PromptedTriggeredAbility {
    constructor(game, card, properties) {
        super(game, card, properties.canCancel ? 'cancelreaction' : 'insteadreaction', properties);
    }
}

module.exports = CardInsteadReaction;
