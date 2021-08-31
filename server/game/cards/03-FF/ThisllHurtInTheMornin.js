const ActionCard = require('../../actioncard.js');
const GameActions = require('../../GameActions/index.js');

class ThisllHurtInTheMornin extends ActionCard {
    setupCardAbilities() {
        this.action({
            title: 'This\'ll Hurt in the Morning',
            playType: ['cheatin resolution'],
            target: {
                activePromptTitle: 'Choose up to 2 cards',
                cardCondition: { location: 'draw hand', controller: 'opponent' },
                cardType: ['dude', 'deed', 'goods', 'spell', 'action', 'joker'],
                numCards: 2
            },
            message: context => 
                this.game.addMessage('{0} uses {1} to discard {2} from {3}\'s draw hand and replaces it/them from {3}\'s draw deck', 
                    context.player, this, context.target, context.player.getOpponent()),
            handler: context => {
                context.player.discardCards(context.target, false, (discardedCards) => {
                    const opponent = context.player.getOpponent();
                    const topCards = opponent.drawDeck.slice(0, discardedCards.length);
                    topCards.forEach(card => opponent.moveCardWithContext(card, 'draw hand', context));
                    if(!context.player.isCheatin()) {
                        discardedCards.forEach(card => {
                            this.game.queueSimpleStep(() => {
                                if(opponent.getSpendableGhostRock() > 0) {
                                    context.game.promptForYesNo(opponent, {
                                        title: `Do you want to pay 1 GR for ${card.title} ?`,
                                        onYes: () => {
                                            this.game.transferGhostRock({
                                                from: opponent,
                                                to: context.player,
                                                amount: 1
                                            });
                                            this.game.addMessage('{0} pays 1 GR to {1} so the {2} is not aced as result of {3}', 
                                                opponent, context.player, card, this);
                                        },
                                        onNo: () => {
                                            this.game.resolveGameAction(GameActions.aceCard({ card }), context);
                                            this.game.addMessage('{0} does not pay 1 GR for the {1} which is aced as result of {2}', opponent, card, this);
                                        }
                                    });
                                } else {
                                    this.game.resolveGameAction(GameActions.aceCard({ card }), context);
                                    this.game.addMessage('{0} does not have 1 GR to pay for the {1} which is aced as result of {2}', opponent, card, this);
                                }
                            });
                        });
                    }
                    opponent.determineHandResult('\'s hand has been changed to');
                }, {}, context);
            }
        });
    }
}

ThisllHurtInTheMornin.code = '05038';

module.exports = ThisllHurtInTheMornin;
