const PromptedTriggeredAbility = require('./promptedtriggeredability.js');
const Spell = require('./spell.js');

class SpellBeforeReaction extends PromptedTriggeredAbility {
    constructor(game, card, properties) {
        super(game, card, 'beforereaction', properties);
        this.spell = new Spell(this, properties);
    }

    meetsRequirements(context) {
        if(super.meetsRequirements(context)) {
            return this.spell.canBeCasted(context.player);
        }
        return false;
    }

    executeHandler(context) {
        this.spell.executeSpell(context, () => super.executeHandler(context));
    }
}

module.exports = SpellBeforeReaction;
