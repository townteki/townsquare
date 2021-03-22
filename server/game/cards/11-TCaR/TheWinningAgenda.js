const ActionCard = require('../../actioncard.js');
//const GameActions = require('../../GameActions/index.js');

class TheWinningAgenda extends ActionCard {
    setupCardAbilities(/*ability*/) {
        /*this.action({
            title: 'The Winning Agenda',
            playType: ['noon'],
            choosePlayer: false,
            cost: [
                ability.costs.discardFromHand( () => cardType: dude, ), 
            ]
        })*/
        this.action({
            title: 'Cheatin\' Resolution: The Winning Agenda',
            playType: ['cheatin resolution'],
            choosePlayer: false,
            target: {
                activePromptTitle: 'Select your dude',
                waitingPromptTitle: 'Waiting on opponent to select a dude',
                cardCondition: { location: 'play area', controller: 'player' },
                cardType: ['dude']
            },
            handler: context => {
                let rankMod = context.target.influence;
                if(rankMod > 3) {
                    rankMod = 3;
                }
                context.player.modifyRank(rankMod);
                this.game.addMessage('{0} uses {1} to increase their hand rank by {2}; Current rank is {3}', context.player, this, context.target.influence, context.player.getTotalRank());
            }
        });
    }
}

TheWinningAgenda.code = '19045';

module.exports = TheWinningAgenda;
