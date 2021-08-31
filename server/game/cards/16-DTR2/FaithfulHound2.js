const GameActions = require('../../GameActions/index.js');
const GoodsCard = require('../../goodscard.js');

class FaithfulHound2 extends GoodsCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Faithful Hound',
            playType: ['shootout'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose a goods',
                cardCondition: { location: 'play area', controller: 'opponent', condition: card => card.parent.isParticipating() },
                cardType: ['goods']
            },
            handler: context => {
                context.player.handlePull({
                    successCondition: pulledValue => pulledValue < context.target.value,
                    successHandler: () => {
                        if(context.target.allowGameAction('discard', context)) {
                            this.game.promptForYesNo(context.player, {
                                title: `Do you want to discard ${this.title} to discard ${context.target.title} ?`,
                                onYes: player => {
                                    this.game.resolveGameAction(GameActions.discardCard({ card: this }), context).thenExecute(() => {
                                        this.game.resolveGameAction(GameActions.discardCard({ card: context.target }), context).thenExecute(() => {
                                            this.game.addMessage('{0} uses {1} and discards it to discard {2}', player, this, context.target);
                                        });  
                                    });
                                },
                                onNo: player => {
                                    this.game.resolveGameAction(GameActions.bootCard({ card: context.target }), context).thenExecute(() => {
                                        this.game.addMessage('{0} uses {1} to boot {2}', player, this, context.target);
                                    });                                      
                                }
                            });
                        }
                    },
                    failHandler: () => {
                        this.game.addMessage('{0} uses {1} and tries to discard/boot {2}, but fails', context.player, this, context.target);
                    },
                    source: this
                }, context);
            }
        });
    }
}

FaithfulHound2.code = '25197';

module.exports = FaithfulHound2;
