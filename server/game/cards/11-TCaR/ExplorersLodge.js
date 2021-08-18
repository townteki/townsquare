const DeedCard = require('../../deedcard.js');
const GameActions = require('../../GameActions/index.js');

class ExplorersLodge extends DeedCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Explorer\'s Lodge',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Select a dude here',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'any', 
                    condition: card => card.gamelocation === this.uuid 
                },
                cardType: ['dude'],
                gameAction: ['moveDude', 'boot']
            },
            message: context => 
                this.game.addMessage('{0} uses {1} to move {2} to Town Square booted', context.player, this, context.target),
            handler: context => {
                this.game.resolveGameAction(GameActions.moveDude({ 
                    card: context.target, 
                    targetUuid: this.game.townsquare.uuid, 
                    options: { 
                        needToBoot: true 
                    } 
                }), context);
                if(context.player.getSpendableGhostRock() >= 2) {
                    this.game.promptForYesNo(context.target.owner, {
                        title: `Do you want to pay 2 GR to unboot ${context.target.title} ?`,
                        onYes: player => {
                            player.spendGhostRock(2);
                            this.game.resolveGameAction(GameActions.unbootCard({ card: context.target }), context).thenExecute(() => {
                                this.game.addMessage('{0} pays 2 GR to unboot {1} who just left the {2}', player, context.target, this);
                            });
                        },
                        source: this
                    });
                }
            }
        });
    }
}

ExplorersLodge.code = '19024';

module.exports = ExplorersLodge;
