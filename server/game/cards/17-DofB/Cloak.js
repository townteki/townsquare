const SpellCard = require('../../spellcard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class Cloak extends SpellCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.spellReaction({
            triggerBefore: true,
            when: {
                onDudeSentHome: event => this.parent && this.parent.equals(event.card) &&
                    event.params.options.reason === 'callout_reject'
            },
            cost: [ability.costs.bootSelf()],
            difficulty: 5,
            onSuccess: (context) => {
                context.event.cancel(); 
                this.game.addMessage('{0} uses {1} to make {2} invisible so they stay put after refusing a callout', 
                    context.player, this, context.event.card);
            },
            source: this
        });
    }
}

Cloak.code = '25046';

module.exports = Cloak;
