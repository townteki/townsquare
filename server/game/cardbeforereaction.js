const PromptedTriggeredAbility = require('./promptedtriggeredability.js');

class CardBeforeReaction extends PromptedTriggeredAbility {
    constructor(game, card, properties) {
        super(game, card, 'beforereaction', properties);
    }
}

module.exports = CardBeforeReaction;
