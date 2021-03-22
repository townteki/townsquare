const ActionCard = require('../../actioncard.js');
const GameActions = require('../../GameActions/index.js');

//var bulletcount;

class PointBlank extends ActionCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Resolution: Point Blank',
            playType: ['resolution'],
            choosePlayer: false,
            cost: [
                ability.costs.boot({
                    controller: 'current',
                    cardCondition: { location: 'play area', participating: true, condition: card => {
                        card.iStud() } },
                    cardType: ['dude'],
                })],
            target: {
                choosingPlayer: 'opponent',
                activePromptTitle: 'Select your dude to ace',
                waitingPromptTitle: 'Waiting on opponent to select a dude',
                cardCondition: { location: 'play area', condition: card => card.bullets < context.costs.boot.bullets, participating: true },
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
