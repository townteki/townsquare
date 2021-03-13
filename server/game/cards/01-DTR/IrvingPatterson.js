const DudeCard = require('../../dudecard.js');

class IrvingPatterson extends DudeCard {
    setupCardAbilities() {
        this.traitReaction({
            when: {
                onDudeJoinedPosse: event => event.card === this
            },
            message: context =>
                context.game.addMessage('{0} uses {1} to gain a ghost rock for joining the posse.', this.controller, this),
            handler: context => {
                context.player.modifyGhostRock(1);
            }
        });
    }
}

IrvingPatterson.code = '01025';

module.exports = IrvingPatterson;
