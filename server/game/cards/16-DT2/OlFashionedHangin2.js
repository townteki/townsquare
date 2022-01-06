const ActionCard = require('../../actioncard');
const GameActions = require('../../GameActions');

class OlFashionedHangin2 extends ActionCard {
    setupCardAbilities() {
        this.job({
            title: 'Ol\' Fashioned Hangin\'',
            playType: 'noon',
            target: {
                activePromptTitle: 'Choose a wanted dude to hang',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'opponent',
                    wanted: true, 
                    condition: card => card.bounty >= 2 
                },
                cardType: ['dude']
            },
            message: context => 
                this.game.addMessage('{0} uses {1} to lead a job to hang {2}', context.player, this, context.target),
            onSuccess: (job, context) => {
                if(job.mark.location === 'play area') {
                    this.game.resolveGameAction(GameActions.aceCard({ card: job.mark }), context);
                }
                if(job.leader.location === 'play area') {
                    this.game.addMessage('{0}\'s hangman, {1}, gains 1 CP as a result of {2}', context.player, job.leader, this);
                    job.leader.modifyControl(1);
                }
            }
        });
    }
}

OlFashionedHangin2.code = '24227';

module.exports = OlFashionedHangin2;
