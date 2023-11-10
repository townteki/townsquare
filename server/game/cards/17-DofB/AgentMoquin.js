const DudeCard = require('../../dudecard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class AgentMoquin extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.reaction({
            title: 'React: Cancel action',
            triggerBefore: true,
            when: {
                onAbilityResolutionStarted: event => this.isParticipating() && !this.controller.equals(event.context.player) &&
                    ['shootout', 'shootout:join'].includes(event.ability.playTypePlayed()) &&
                    event.ability.card.getType() === 'action' &&
                    (!event.ability.card.getPrintedStat('cost') || event.ability.card.getPrintedStat('cost') === 0)
            },
            cost: ability.costs.bootSelf(),
            message: context => 
                this.game.addMessage('{0} uses {1} to cancel {2}\'s ability', 
                    context.player, this, context.event.ability.card),
            handler: context => {
                this.lastingEffect(context.event.ability, ability => ({
                    until: {
                        onCardAbilityResolved: event => event.ability === context.event.ability
                    },
                    match: this,
                    effect: ability.effects.setActionPlacementLocation('discard pile')
                }));                 
                context.event.ability.cancel(true); 
            }
        });
    }
}

AgentMoquin.code = '25028';

module.exports = AgentMoquin;
