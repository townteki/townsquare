const ActionCard = require('../../actioncard.js');

class Kidnappin2 extends ActionCard {
    setupCardAbilities(ability) {
        this.job({
            title: 'Kidnappin\'',
            playType: 'noon',
            cost: ability.costs.bootLeader(),
            target: {
                activePromptTitle: 'Select dude to kidnap',
                cardCondition: { location: 'play area', controller: 'opponent' },
                cardType: 'dude'
            },
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

Kidnappin2.code = '25129';

module.exports = Kidnappin2;
