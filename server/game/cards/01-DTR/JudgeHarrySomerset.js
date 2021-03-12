const DudeCard = require('../../dudecard.js');

class JudgeHarrySomerset extends DudeCard {
    setupCardAbilities(ability) {
        this.job({
            title: 'Judge Harry Somerset',
            playType: 'noon',
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose wanted dude to hang',
                cardCondition: { location: 'play area', controller: 'opponent', wanted: true },
                cardType: ['dude']
            },
            message: context => 
                this.game.addMessage('{0} uses {1} to lead a job to hang {2}', context.player, this, context.target),
            onSuccess: (job) => {
                job.mark.controller.aceCard(job.mark);
            }
        });
    }
}

JudgeHarrySomerset.code = '01016';

module.exports = JudgeHarrySomerset;
