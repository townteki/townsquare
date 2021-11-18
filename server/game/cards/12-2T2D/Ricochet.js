const ActionCard = require('../../actioncard.js');
const GameActions = require('../../GameActions/index.js');

class Ricochet extends ActionCard {
    setupCardAbilities() {
        this.action({
            title: 'Ricochet',
            playType: ['cheatin resolution'],
            handler: context => {
                if(this.game.shootout) {
                    const opponent = context.player.getOpponent();
                    const shooter = this.game.shootout.getPosseByPlayer(opponent).shooter;
                    this.game.resolveGameAction(GameActions.discardCard({ card: shooter }), context).thenExecute(() => {
                        this.game.addMessage('{0} uses {1} to discard {2}', context.player, this, shooter);
                    });
                    if(!context.player.isCheatin()) {
                        this.game.resolveGameAction(GameActions.decreaseCasualties({ player: context.player }), context);   
                        context.player.drawCardsToHand(1, context);
                        this.game.addMessage('{0} does not take any casualties this round and draws a card thanks to {1}', context.player, this);
                    }
                }
            }
        });
    }
}

Ricochet.code = '20056';

module.exports = Ricochet;
