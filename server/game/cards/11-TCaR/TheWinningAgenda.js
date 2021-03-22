const ActionCard = require('../../actioncard.js');

class TheWinningAgenda extends ActionCard {
    setupCardAbilities() {
        this.action({
            title: 'Cheatin\' Resolution: The Winning Agenda',
            playType: 'cheatin resolution',
            target: {
                cardCondition: { location: 'play area', controller: 'current' },
                cardType: 'dude'
            },
            handler: context => {
                let rankMod = context.target.influence;
                if (rankMod > 3) {
                    rankMod = 3
                }
                context.player.modifyRank(rankMod);
                this.game.addMessage('{0} uses {1} to increase their hand rank by {2}; Current rank is {3}', 
                    context.player, this, rankMod, context.player.getTotalRank());
            }
        });
    } 
}

TheWinningAgenda.code = '19045';

module.exports = TheWinningAgenda;
