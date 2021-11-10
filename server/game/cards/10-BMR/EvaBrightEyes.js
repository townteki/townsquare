const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class EvaBrightEyes extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.persistentEffect({
            match: this,
            effect: ability.effects.cannotCastSpell(this, card => 
                !card.hasKeyword('spirit') ||
                !card.hasOneOfKeywords(['sidekick', 'totem']))
        });

        this.action({
            title: 'Shootout: Eva Bright Eyes',
            playType: ['shootout'],
            cost: ability.costs.boot(card => card.parent === this &&
                card.hasKeyword('horse')),
            actionContext: { card: this, gameAction: ['sendHome', 'boot'] },
            message: context => 
                this.game.addMessage('{0} uses {1} and boots {2} to send her home booted', 
                    context.player, this, context.costs.boot),
            handler: context => {
                this.game.resolveGameAction(GameActions.sendHome({ card: this }), context);
            }
        });
    }
}

EvaBrightEyes.code = '18011';

module.exports = EvaBrightEyes;
