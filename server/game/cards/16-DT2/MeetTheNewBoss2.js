const ActionCard = require('../../actioncard');

class MeetTheNewBoss2 extends ActionCard {
    setupCardAbilities() {
        this.job({
            title: 'Meet The New Boss',
            playType: 'noon',
            target: 'townsquare',
            message: context => this.game.addMessage('{0} plays {1} to start a job marking Town Square', context.player, this),
            onSuccess: (job, context) => {
                if(job.leader.location !== 'play area') {
                    return true;
                }
                job.leader.modifyControl(1);
                this.game.promptForYesNo(context.player, {
                    title: `Do you want to ace this card to give ${job.leader} +1 influence?`,
                    onYes: player => {
                        job.leader.modifyInfluence(1);
                        context.source.actionPlacementLocation = 'dead pile';
                        this.game.addMessage('{0} aces {1} to give {2} permanent +1 CP and permanent +1 influence', 
                            player, this, job.leader);
                    },
                    onNo: player => {
                        this.game.addMessage('{0} uses {1} to give {2} permanent +1 CP', player, this, job.leader);
                    },
                    source: this
                });
            }
        });
    }
}

MeetTheNewBoss2.code = '24250';

module.exports = MeetTheNewBoss2;
