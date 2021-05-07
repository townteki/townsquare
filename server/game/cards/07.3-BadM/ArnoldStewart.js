const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

class ArnoldStewart extends DudeCard {
    setupCardAbilities() {
        this.action({
            title: 'Arnold Stewart',
            playType: ['noon'],
            target: {
                activePromptTitle: 'Choose a gadget to boot',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'current', 
                    condition: card => card.parent === this && card.hasKeyword('gadget')
                },
                cardType: ['goods'],
                gameAction: 'boot'
            },
            handler: context => {
                this.game.resolveGameAction(GameActions.bootCard({ card: context.target }), context);
                const actualAmount = context.player.getNumCardsToDraw(5);
                const props = {
                    amount: actualAmount,
                    desiredAmount: 5
                };
                const cards = context.player.drawDeckAction(props, card => {
                    context.player.removeCardFromPile(card);
                });
                context.player.discardCards(cards, false, discardedCards => {
                    if(!this.booted && discardedCards.find(card => card.hasKeyword('out of town'))) {
                        context.game.promptForYesNo(context.player, {
                            title: 'Do you want to boot ' + this.title + ' to put one Out of Town deed to your hand?',
                            onYes: () => {
                                this.game.resolveGameAction(GameActions.bootCard({ card: this }), context).thenExecute(() => {
                                    this.game.promptForSelect(context.player, {
                                        activePromptTitle: 'Select a card',
                                        waitingPromptTitle: 'Waiting for opponent to select card',
                                        cardCondition: card => discardedCards.includes(card),
                                        cardType: 'deed',
                                        onSelect: (player, card) => {
                                            player.moveCard(card, 'hand');
                                            this.game.addMessage('{0} uses {1}, boots him and {2} to discard 5 cards from deck and puts {3} to hand', 
                                                player, this, context.target, card);
                                            return true;
                                        },
                                        source: this
                                    });
                                });
                            }, 
                            onNo: player => {
                                this.game.addMessage('{0} uses {1} and boots {2} to discard 5 cards from deck, but does not put any Out of Town deed into their hand', 
                                    player, this, context.target);
                            },
                            source: this
                        });
                    } else {
                        this.game.addMessage('{0} uses {1} and boots {2} to discard 5 cards from deck, but does not put any Out of Town deed into their hand', 
                            context.player, this, context.target);
                    }
                }, {}, context);
            }
        });
    }
}

ArnoldStewart.code = '13008';

module.exports = ArnoldStewart;
