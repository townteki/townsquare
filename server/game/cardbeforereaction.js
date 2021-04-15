const PromptedTriggeredAbility = require('./promptedtriggeredability.js');

class CardBeforeReaction extends PromptedTriggeredAbility {
    constructor(game, card, properties) {
        super(game, card, properties.canCancel ? 'cancelreaction' : 'beforereaction', properties);
    }
}

module.exports = CardBeforeReaction;
