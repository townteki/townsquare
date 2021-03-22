const ActionCard = require('../../actioncard.js');
const GameActions = require('../../GameActions/index.js');

class PointBlank extends ActionCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Resolution: Point Blank',
            playType: ['resolution'],
            choosePlayer: false,
            cost: [
                ability.costs.boot({
                    location: 'play area',
                    controller: 'current',
                    condition: card => card.isStud(),
                    cardCondition: { /*location: 'play area',*/ participating: true },
                    cardType: ['dude']
                })],
            target: {
                choosingPlayer: 'opponent',
                activePromptTitle: 'Select your dude to ace',
                waitingPromptTitle: 'Waiting on opponent to select a dude',
                condition: card => card.bullets < context.costs.boot.bullets,
                cardCondition: { location: 'play area', participating: true },
                cardType: ['dude']
            },
            message: context => {
                this.game.addMessage('{0} uses {1} to boot {2}, which causes {3} to ace {4}', context.player, this, context.costs.boot, context.player.getOpponent(), context.target);
            },
            handler: context => {
                this.game.resolveGameAction(GameActions.aceCard({ card: context.target }), context);
            }
        });
    }
}

PointBlank.code = '01142';

module.exports = PointBlank;
