const ActionCard = require('../../actioncard.js');

class ActionName extends ActionCard {
    setupCardAbilities() {
        this.job({
            title: 'Meet The New Boss',
            playType: 'noon',
            target: 'townsquare',
            message: context => this.game.addMessage('{0} plays {1} to start a job marking Town Square', context.player, this),
            onSuccess: (job, context) => {
                job.leader.modifyControl(1);
                job.leader.modifyInfluence(1);
                context.source.actionPlacementLocation = 'dead pile';
                this.game.addMessage('{0}\'s leader of the job {1} permanently gets +1 influence and 1 CP', 
                    context.player, job.leader);
            },
            onFail: (job, context) => {
                context.source.actionPlacementLocation = 'dead pile';          
            }
        });
    }
}

ActionName.code = '05040';

module.exports = ActionName;
