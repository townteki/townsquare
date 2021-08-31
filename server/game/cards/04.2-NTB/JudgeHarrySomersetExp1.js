const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

class JudgeHarrySomersetExp1 extends DudeCard {
    setupCardAbilities(ability) {
        this.job({
            title: 'Judge Harry Somerset (Exp.1)',
            playType: 'noon',
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose wanted dude to hang',
                cardCondition: { location: 'play area', controller: 'opponent', wanted: true },
                cardType: ['dude']
            },
            message: context => 
                this.game.addMessage('{0} uses {1} to lead a job to hang {2} with some help from the Gunslinger', 
                    context.player, this, context.target),
            handler: context => {
                const gunslinger = context.player.placeToken('Gunslinger', context.target.gamelocation, { booted: true });
                this.game.resolveGameAction(GameActions.joinPosse({ card: gunslinger }), context);
            },
            onSuccess: (job, context) => {
                this.game.resolveGameAction(GameActions.discardCard({ card: job.mark }), context);
            }
        });
    }
}

JudgeHarrySomersetExp1.code = '07002';

module.exports = JudgeHarrySomersetExp1;
