const ActionCard = require('../../actioncard.js');

class Kidnappin extends ActionCard {
    setupCardAbilities(ability) {
        this.job({
            title: 'Kidnappin\'',
            playType: 'noon',
            cost: ability.costs.bootLeader(),
            target: {
                activePromptTitle: 'Select dude to kidnap',
                cardCondition: { location: 'play area', controller: 'any' },
                cardType: 'dude'
            },
            posseCondition: (job, posseSelection) =>
                job.leader.bullets + posseSelection.reduce((agg, dude) => agg + dude.bullets, 0) > job.mark.bullets,
            message: context =>
                this.game.addMessage('{0} plays {1} on {2}', context.player, this, context.target),
            handler: () => {
                this.game.once('onLeaderPosseFormed', event => event.shootout.actOnLeaderPosse(dude => dude.increaseBounty()));
            },
            onSuccess: (job, context) => {
                if(this.game.discardFromPlay([job.mark], true, () => true, { isCardEffect: true }, context)) {
                    this.game.addMessage('{0} was discarded as a result of the {1}', job.mark, this);
                }
            }
        });
    } 
}

Kidnappin.code = '01123';

module.exports = Kidnappin;
