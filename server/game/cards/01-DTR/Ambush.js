const ActionCard = require('../../actioncard.js');
const GameActions = require('../../GameActions/index.js');

class Ambush extends ActionCard {
    setupCardAbilities() {
        this.job({
            title: 'Ambush',
            playType: 'noon',
            bootLeader: 'true',
            target: {
                activePromptTitle: 'Choose a dude to ambush',
                waitingPromptTitle: 'Waiting for opponent to choose a dude',
                cardCondition: { location: 'play area' },
                cardType: ['dude']
            },
            handler: (context) => {
                if(!context.target.isWanted()) {
                    this.game.once('onLeaderPosseFormed', event => event.shootout.actOnLeaderPosse(dude => dude.increaseBounty()));
                    this.game.addMessage('{0}\'s posse all receive 1 bounty since {1} is not wanted', context.player, context.target);
                }
            },
            message: context => 
                this.game.addMessage('{0} uses {1} to lead an ambush against {2}', context.player, this, context.target),
            onSuccess: (job, context) => {
                this.game.resolveGameAction(GameActions.aceCard({ card: job.mark }), context);
            }
        });
    }
}

Ambush.code = '01114';

module.exports = Ambush;
