const DudeCard = require('../../dudecard.js');

class MiltClemons extends DudeCard {
    setupCardAbilities() {
        this.traitReaction({
            when: {
                onCardBountyAdded: event => event.card === this
            },
            handler: () => {
                this.controller.modifyGhostRock(1);
                this.game.addMessage('{0} gains 1 ghostrock from {1} gaining bounty', this.controller, this);
            }
        });
    }
}

MiltClemons.code = '04008';

module.exports = MiltClemons;
