const ActionCard = require('../../actioncard.js');

class CheatinVarmint extends ActionCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Resolution: Lower hand by 2 ranks',
            playType: ['resolution'],
            choosePlayer: true,
            cost: ability.costs.payGhostRock(5),
            handler: context => {
                if(context.chosenPlayer.modifyRank(-2, context)) {
                    this.game.addMessage('{0} uses {1} and pays 5 GR to lower {2}\'s draw hand by 2 ranks. Current rank is {3}', 
                        context.player, this, context.chosenPlayer, context.chosenPlayer.getTotalRank());
                }
            }});
        this.action({
            title: 'Cheatin\' Resolution: Lower hand by 2 ranks',
            playType: ['cheatin resolution'],
            choosePlayer: true,
            handler: context => {
                if(context.chosenPlayer.modifyRank(-2, context)) {
                    this.game.addMessage('{0} uses {1} to lower {2}\'s draw hand by 2 ranks. Current rank is {3}', 
                        context.player, this, context.chosenPlayer, context.chosenPlayer.getTotalRank());
                }
            }});
    }
}

CheatinVarmint.code = '01129';

module.exports = CheatinVarmint;
