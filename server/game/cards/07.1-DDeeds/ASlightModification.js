const ActionCard = require('../../actioncard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class ASlightModification extends ActionCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.reaction({
            title: 'React: A Slight Modification',
            triggerBefore: true,
            when: {
                onAbilityResolutionStarted: event => event.context.player !== this.controller &&
                    ['shootout', 'shootout:join', 'resolution'].includes(event.ability.playTypePlayed())
            },
            cost: ability.costs.boot(card => card.isParticipating() &&
                card.parent && card.parent.getType() === 'dude' &&
                card.hasKeyword('gadget')),
            message: context => 
                this.game.addMessage('{0} uses {1} and boots {2} to prevent any effect of a {3}', 
                    context.player, this, context.costs.boot, context.event.ability.card),
            handler: context => {
                context.replaceHandler(event => event.ability.incrementLimit());  
            }
        });
    }
}

ASlightModification.code = '11022';

module.exports = ASlightModification;
