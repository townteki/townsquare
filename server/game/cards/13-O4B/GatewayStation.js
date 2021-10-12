const PhaseNames = require('../../Constants/PhaseNames.js');
const DeedCard = require('../../deedcard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class GatewayStation extends DeedCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.reaction({
            title: 'React: Gateway Station',
            triggerBefore: true,
            when: {
                onDrawHandDiscarded: event => event.player === this.controller && this.game.currentPhase === PhaseNames.Gambling
            },
            cost: [
                ability.costs.bootSelf(),
                ability.costs.payGhostRock(1),
                ability.costs.discardFromHand()
            ],
            target: {
                activePromptTitle: 'Choose a card to take',
                choosingPlayer: 'current',
                cardCondition: { location: 'draw hand', controller: 'current' },
                cardType: ['dude']
            },
            message: context => 
                this.game.addMessage('{0} uses {1} and discards {2} to put {3} into their play hand ', 
                    context.player, this, context.costs.discardFromHand, context.target),
            handler: context => {
                context.player.moveCardWithContext(context.target, 'hand', context);
            }
        });
    }
}

GatewayStation.code = '21039';

module.exports = GatewayStation;
