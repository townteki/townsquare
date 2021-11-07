const ActionCard = require('../../actioncard.js');
const GameActions = require('../../GameActions/index.js');

class FoolMeOnce extends ActionCard {
    setupCardAbilities() {
        this.traitReaction({
            when: {
                onDrawHandsRevealed: () => this.parent && this.parent.getType() === 'outfit' && this.parent.controller.isCheatin()
            },
            ignoreActionCosts: true,
            handler: context => {
                const theotherone = this.parent.controller.getOpponent();
                this.game.resolveGameAction(GameActions.drawCards({ player: theotherone, amount: 1 }), context).thenExecute(() => {
                    this.game.addMessage('{0} draws a card due to {1}', theotherone, this);
                });
            }
        });

        this.action({
            title: 'Fool Me Once...',
            playType: 'cheatin resolution',
            handler: context => {
                const theirhome = context.player.getOpponent().getOutfitCard();
                context.player.attach(this, theirhome, 'ability', () => {
                    this.game.resolveGameAction(GameActions.drawCards({ player: context.player, amount: 3 }), context).thenExecute(() => {
                        this.game.addMessage('{0} uses {1}, attaches it to {2} and draws 3 cards', 
                            context.player, this, theirhome);
                    });
                });
            }
        });
    }
}

FoolMeOnce.code = '14032';

module.exports = FoolMeOnce;
