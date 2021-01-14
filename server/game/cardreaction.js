const PromptedTriggeredAbility = require('./promptedtriggeredability.js');

class CardReaction extends PromptedTriggeredAbility {
    constructor(game, card, properties) {
        super(game, card, 'reaction', properties);
        this.used = false;
        this.canRepeat = properties.canRepeat;
    }

    executeHandler(context) {
        super.executeHandler(context);
        if (!this.canRepeat) {
            this.used = true;
        }
    }

    meetsRequirements(context) {
        if (!super.meetsRequirements(context)) {
            return false;
        }

        if(this.used) {
            return false;
        }
        
        return true;
    }
}

module.exports = CardReaction;
