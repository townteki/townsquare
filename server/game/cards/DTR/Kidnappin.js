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
            handler: context => {
                this.game.once('onLeaderPosseFormed', event => event.shootout.actOnLeaderPosse(dude => dude.increaseBounty()));
                this.game.addMessage('{0} plays {1} on {2}.', context.player, this, context.target);
            },
            onSuccess: (job) => {
                if(this.game.discardFromPlay([job.mark])) {
                    this.game.addMessage('{0} was discarded as a result of the {1}.', job.mark, this);
                }
            }
        });
    } 
}

Kidnappin.code = '01123';

module.exports = Kidnappin;
