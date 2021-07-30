const DudeCard = require('../../dudecard.js');

class IrvingPatterson2 extends DudeCard {
    setupCardAbilities() {
        this.traitReaction({
            when: {
                onDudeJoinedPosse: event => event.card === this
            },
            message: context =>
                context.game.addMessage('{0} uses {1} to gain a ghost rock for joining the posse', this.controller, this),
            handler: context => {
                context.player.modifyGhostRock(1);
            }
        });
    }
}

IrvingPatterson2.code = '25014';

module.exports = IrvingPatterson2;
