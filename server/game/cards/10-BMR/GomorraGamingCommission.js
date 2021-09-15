const DeedCard = require('../../deedcard.js');
const GameActions = require('../../GameActions/index.js');

class GomorraGamingCommission extends DeedCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Gomorra Gaming Commission',
            playType: ['cheatin resolution'],
            cost: ability.costs.bootSelf(),
            handler: context => {
                const opponent = context.player.getOpponent();
                this.modifyProduction(1);
                this.game.queueSimpleStep(() => {
                    if(opponent.getSpendableGhostRock() > 0) {
                        context.game.promptForYesNo(opponent, {
                            title: `Do you want to pay 1 GR to ${context.player} for them to not draw a card?`,
                            onYes: () => {
                                this.game.transferGhostRock({
                                    from: opponent,
                                    to: context.player,
                                    amount: 1
                                });
                                this.game.addMessage('{0} uses {1} to boost its production by 1, {2} pays them 1 GR to keep them from drawing a card', 
                                    context.player, this, opponent);
                            },
                            onNo: () => {
                                this.game.resolveGameAction(GameActions.drawCards({ player: context.player, amount: 1 }), context).thenExecute(() => {
                                    this.game.addMessage('{0} uses {1} to boost its production by 1 and draw a card', context.player, this);
                                });
                            }
                        });
                    } else {
                        this.game.resolveGameAction(GameActions.drawCards({ player: context.player, amount: 1 }), context).thenExecute(() => {
                            this.game.addMessage('{0} uses {1} to boost its production by 1 and draw a card', context.player, this);
                        });
                    }
                }
            }
        });
    }
}

GomorraGamingCommission.code = '18024';

module.exports = GomorraGamingCommission;
