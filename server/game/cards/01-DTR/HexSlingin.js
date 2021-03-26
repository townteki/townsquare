const ActionCard = require('../../actioncard.js');
//const GameActions = require('../../GameActions/index.js');

class HexSlingin extends ActionCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Resolution: Hex Slingin\'', 
            playType: ['resolution'],
            cost: [
                ability.costs.discardfromPlay(card => //should be new method
                    card.getType === 'spell' &&
                    card.location === 'play area'

                )
            ],
            handler: context => {
                context.player.modifyRank(2);
                this.game.addMessage('{0} uses {1} to raise his/her draw hand by 2 ranks. Current rank is {2}', 
                    context.player, this, context.player.getTotalRank());
            }

        });
    }
}

HexSlingin.code = '01136';

module.exports = HexSlingin;
