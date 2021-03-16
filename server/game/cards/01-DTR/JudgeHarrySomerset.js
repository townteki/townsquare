const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

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
            onSuccess: (job, context) => {
                this.game.resolveGameAction(GameActions.aceCard({ card: job.mark }), context);
            }
        });
    }
}

JudgeHarrySomerset.code = '01016';

module.exports = JudgeHarrySomerset;
