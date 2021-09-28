const ActionCard = require('../../actioncard.js');
const GameActions = require('../../GameActions/index.js');

class FoolMeOnce extends ActionCard {
    setupCardAbilities(ability) {
        this.traitReaction({
            when: {
                onDrawHandsRevealed: () => this.parent && this.parent.getType() === 'outfit' && this.parent.controller.isCheatin()
            },
            handler: context => {
                const theotherone = this.parent.controller.getOpponent();
                this.game.resolveGameAction(GameActions.drawCards({player: theotherone, amount: 1}), context).thenExecute(() => {
                    this.game.addMessage('{0} draws a card due to {1}', theotherone, this);
                });
            }
        });

        this.action({
            title: 'Fool Me Once...',
            playType: 'cheatin resolution',
            message: context => 
                this.game.addMessage('{0} plays {1}', context.player, this),
            handler: context => {
                const theirhome = context.player.getOpponent().getOutfitCard();
                context.player.attach(this, theirhome, 'ability', () => {
                    this.game.resolveGameAction(GameActions.drawCards({player: context.player, amount: 3}), context).thenExecute(() => {
                        this.game.addMessage('{0} attaches {1} to {2} and draws 3 cards', context.player, this, theirhome);
                    });
                });
            }
        });
    }
}

FoolMeOnce.code = '14032';

module.exports = FoolMeOnce;
