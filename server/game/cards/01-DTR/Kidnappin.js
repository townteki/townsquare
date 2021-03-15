const ActionCard = require('../../actioncard.js');

class Kidnappin extends ActionCard {
    setupCardAbilities() {
        this.job({
            title: 'Kidnappin\'',
            playType: 'noon',
            bootLeader: true,
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
            onSuccess: (job) => {
                if(this.game.discardFromPlay([job.mark])) {
                    this.game.addMessage('{0} was discarded as a result of the {1}', job.mark, this);
                }
            }
        });
    } 
}

Kidnappin.code = '01123';

module.exports = Kidnappin;
