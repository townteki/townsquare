const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class StewartDavidson extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.action({
            title: 'Noon: Stewart Davidson',
            playType: ['noon'],
            cost: [
                ability.costs.bootSelf(),
                ability.costs.discardFromHand(),
                ability.costs.payGhostRock(context => context.target.influence)
            ],
            target: {
                activePromptTitle: 'Choose a dude to get bounty',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'opponent', 
                    wanted: false,
                    condition: (card, context) => 
                        card.influence <= context.player.getSpendableGhostRock({ 
                            activePlayer: context.player,
                            context 
                        })
                },
                cardType: ['dude']
            },
            message: context => 
                this.game.addMessage('{0} uses {1} to add 1 bounty to {2}', context.player, this, context.target),
            handler: context => {
                this.game.resolveGameAction(GameActions.addBounty({ card: context.target }), context);
            }
        });
    }
}

StewartDavidson.code = '19011';

module.exports = StewartDavidson;
