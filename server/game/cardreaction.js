const AbilityUsage = require('./abilityusage.js');
const PromptedTriggeredAbility = require('./promptedtriggeredability.js');

class CardReaction extends PromptedTriggeredAbility {
    constructor(game, card, properties) {
        super(game, card, 'reaction', properties);
        this.usage = new AbilityUsage(properties);
    }

    executeHandler(context) {
        super.executeHandler(context);
        this.usage.increment();
    }

    meetsRequirements(context) {
        if(!super.meetsRequirements(context)) {
            return false;
        }
    
        if(this.game.shootout && this.game.shootout.headlineUsed && this.card.hasKeyword('headline')) {
            return false;
        }

        if(this.usage.isUsed()) {
            return false;
        }
        
        return true;
    }

    playTypePlayed() {
        return 'react';
    }
}

module.exports = CardReaction;
