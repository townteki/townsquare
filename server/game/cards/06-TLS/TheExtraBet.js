const DeedCard = require('../../deedcard.js');
const GameActions = require('../../GameActions/index.js');

class TheExtraBet extends DeedCard {
    setupCardAbilities(ability) {
        this.reaction({
            title: 'React The Extra Bet',
            when: {
                onPlayersAntedForLowball: () => this.controller.getSpendableGhostRock() >= 1
            },
            cost: ability.costs.bootSelf(),
            message: context => 
                this.game.addMessage('{0} uses {1} to ante additional GR for lowball', context.player, this),
            handler: context => {
                context.player.spendGhostRock(1);
                context.event.gamblingPhase.lowballPot += 1;
                this.game.onceConditional('onCardsDrawn', { 
                    condition: event => event.reason === 'lowball' && event.player === context.player
                }, () => {
                    this.game.promptForSelect(context.player, {
                        activePromptTitle: 'Select a card to replace',
                        waitingPromptTitle: 'Waiting for opponent to select card',
                        cardCondition: card => card.location === 'draw hand' && card.owner === context.player,
                        onSelect: (player, cardToDiscard) => {
                            this.game.resolveGameAction(GameActions.discardCard({ card: cardToDiscard }), context).thenExecute(() => {
                                if(!player.drawDeck.length) {
                                    player.shuffleDiscardToDrawDeck();
                                }
                                player.moveCard(player.drawDeck[0], 'draw hand');
                                this.game.addMessage('{0} uses {1} to discard {2} from their draw hand and replace it ' +
                                'with the top card of their deck', context.player, this, cardToDiscard);
                            });
                            return true;
                        },
                        source: this
                    });
                });
            }
        });
    }
}

TheExtraBet.code = '10020';

module.exports = TheExtraBet;
