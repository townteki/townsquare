const ActionCard = require('../../actioncard.js');
const GameActions = require('../../GameActions/index.js');

class MartyrsCry extends ActionCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Resolution: Martyr\'s Cry',
            playType: 'resolution',
            cost: ability.costs.discardFromPlay({
                type: 'spell',
                condition: card => card.isMiracle() && card.parent.isParticipating()
            }),
            handler: context => {
                const cryStrength = (context.player.getOpponent().isCheatin() ? 5 : 3);
                this.game.resolveGameAction(GameActions.decreaseCasualties({
                    player: context.player,
                    amount: cryStrength
                }), context).thenExecute(() => {
                    this.game.addMessage('{0} uses {1}, discarding {2} to reduce their casualties by {3}',
                        context.player, this, context.costs.discardFromPlay, cryStrength);
                });
            }
        });
    }
}

MartyrsCry.code = '12020';

module.exports = MartyrsCry;
