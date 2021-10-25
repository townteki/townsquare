const ActionCard = require('../../actioncard.js');
const GameActions = require('../../GameActions/index.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class GetOffMyLand extends ActionCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.reaction({
            title: 'React: Get Off My Land!',
            when: {
                onDudeMoved: event => event.card.controller !== this.owner &&
                    this.owner.findLocation(event.target)
            },
            cost: ability.costs.payGhostRock(context => context.event.card.influence),
            target: {
                activePromptTitle: 'Choose dude to move',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'current', 
                    condition: (card, context) => card.isAdjacent(context.event.target) 
                },
                cardType: ['dude'],
                gameAction: 'moveDude'
            },
            handler: context => {
                this.game.resolveGameAction(GameActions.moveDude({ 
                    card: context.target, 
                    targetUuid: context.event.target 
                }), context).thenExecute(() => {
                    this.game.addMessage('{0} uses {1} to move {2} to {3} to fend off an intruder', 
                        context.player, this, context.target, context.target.locationCard);
                });
            }
        });
    }
}

GetOffMyLand.code = '23047';

module.exports = GetOffMyLand;
