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
            handler: () => true,
            onSuccess: (job) => {
                job.mark.controller.aceCard(job.mark);
                this.game.addMessage('{0} uses {1} to lead a job which hangs {2}.', this.controller, this, job.mark); 
            }
        });
    }
}

JudgeHarrySomerset.code = '01016';

module.exports = JudgeHarrySomerset;
