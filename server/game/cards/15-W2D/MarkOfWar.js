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
                this.game.addMessage('{0} uses {1} on {2} to prevent other dudes from refusing their call outs', 
                    context.player, this, context.event.card);  
            },
            source: this
        });
    }
}

MarkOfWar.code = '23042';

module.exports = MarkOfWar;
