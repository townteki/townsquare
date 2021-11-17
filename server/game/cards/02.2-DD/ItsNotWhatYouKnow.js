const ActionCard = require('../../actioncard.js');

class ItsNotWhatYouKnow extends ActionCard {
    setupCardAbilities() {
        this.action({
            title: 'Resolution: Lower hand by 1 rank',
            playType: ['resolution'],
            choosePlayer: true,
            handler: context => {
                if(context.chosenPlayer.modifyRank(-1, context)) {
                    this.game.addMessage('{0} uses {1} to lower {2}\'s draw hand by 1 rank; Current rank is {3}', 
                        context.player, this, context.chosenPlayer, context.chosenPlayer.getTotalRank());
                }
            }
        });
        this.action({
            title: 'Cheatin\' Resolution: Lower hand by 4 ranks',
            playType: ['cheatin resolution'],
            choosePlayer: true,
            handler: context => {
                if(context.chosenPlayer.modifyRank(-4, context)) {
                    this.game.addMessage('{0} uses {1} to lower {2}\'s draw hand by 4 ranks; Current rank is {3}', 
                        context.player, this, context.chosenPlayer, context.chosenPlayer.getTotalRank());
                }
            }
        });
    }
}

ItsNotWhatYouKnow.code = '03021';

module.exports = ItsNotWhatYouKnow;
