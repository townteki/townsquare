const GameActions = require('../../GameActions/index.js');
const GoodsCard = require('../../goodscard.js');

class XemosTurban extends GoodsCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Xemo\'s Turban',
            playType: ['noon'],
            cost: [
                ability.costs.bootSelf(),
                ability.costs.pull()
            ],
            repeatable: true,
            handler: context => {
                if(context.pull.pulledSuit !== 'Clubs') {
                    if(context.player.getSpendableGhostRock() >= 1) {
                        context.game.promptForYesNo(context.player, {
                            title: 'Do you want to pay to use ' + this.title + ' ?',
                            onYes: player => {
                                player.spendGhostRock(1);
                                this.game.resolveGameAction(GameActions.drawCards({ player: player, amount: 1 }), context).thenExecute(() => {
                                    this.game.promptForSelect(player, {
                                        promptTitle: this.title,
                                        activePromptTitle: 'Select a card to discard',
                                        waitingPromptTitle: 'Waiting for opponent to discard a card',
                                        mode: 'exactly',
                                        numCards: 1,
                                        cardCondition: card => card.location === 'hand' && card.controller === this.controller,
                                        onSelect: (p, cards) => {
                                            this.game.resolveGameAction(GameActions.discardCard({ card: cards[0] }), context).thenExecute(() => {
                                                this.game.addMessage('{0} uses {1} and pays 1 GR to draw a card, and discard {2} and unboot itself', 
                                                    p, this, cards[0]);
                                            });
                                            return true;
                                        }
                                    }); 
                                }); 
                                this.game.resolveGameAction(GameActions.unbootCard({ card: this }), context);
                            },
                            onNo: player =>
                                this.game.addMessage('{0} uses {1} but does not pay 1 GR, thus it has no effect', player, this)
                        });
                    } else {
                        this.game.addMessage('{0} uses {1} but does not have 1 GR to pay, thus it has no effect', context.player, this);
                    }
                } else {
                    this.game.addMessage('{0} uses {1}, but the experiment fails', context.player, this);
                }
            }
        });
    }
}

XemosTurban.code = '12013';

module.exports = XemosTurban;
