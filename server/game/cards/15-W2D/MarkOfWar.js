const GameActions = require('../../GameActions/index.js');
const SpellCard = require('../../spellcard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class MarkOfWar extends SpellCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.spellAction({
            title: 'Noon: Mark of War',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            difficulty: 7,
            onSuccess: (context) => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: this.parent,
                    effect: ability.effects.calloutCannotBeRefused()
                }));
                this.game.resolveGameAction(GameActions.discardCard({ card: this }), context);
                this.game.addMessage('{0} uses {1} to prevent other dudes from refusing {2}\'s call outs', 
                    context.player, this, this.parent); 
            },
            source: this
        });
    }
}

MarkOfWar.code = '23042';

module.exports = MarkOfWar;
