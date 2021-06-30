const ActionCard = require('../../actioncard.js');
const GameActions = require('../../GameActions/index.js');

class Heist extends ActionCard {
    setupCardAbilities() {
        this.job({
            title: 'Heist',
            playType: 'noon',
            target: {
                activePromptTitle: 'Mark an in-town deed',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'any', 
                    condition: card => !card.isOutOfTown() 
                },
                cardType: ['deed']
            },
            message: context => this.game.addMessage('{0} starts a job {1} marking {2}', context.player, this, context.target),
            onSuccess: (job, context) => {
                context.player.modifyGhostRock(job.mark.production);
                this.game.addMessage('{0} uses {1} to gain production of {2} ({3})', 
                    context.player, this, job.mark, job.mark.production);
                if(job.leader.location === 'play area') {
                    if(job.mark.owner !== this.controller) {
                        this.game.resolveGameAction(GameActions.unbootCard({ card: job.leader }), context).thenExecute(() => {
                            this.game.addMessage('{0} unboots dude {1} (leader of job {2})', 
                                context.player, job.leader, this);
                        });
                    }
                    this.game.resolveGameAction(GameActions.addBounty({ card: job.leader, amount: 2 }), context).thenExecute(() => {
                        this.game.addMessage('{0} adds 2 bounty to dude {1} (leader of job {2})', 
                            context.player, job.leader, this);
                    });
                }
            }
        });
    }
}

Heist.code = '20052';

module.exports = Heist;
