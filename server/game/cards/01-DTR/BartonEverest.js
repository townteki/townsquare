const DudeCard = require('../../dudecard.js');

class BartonEverest extends DudeCard {
    setupCardAbilities() {
        this.traitReaction({
            when: {
                onDrawHandsRevealed: event => event.shootout && this.isParticipating() && this.controller.isCheatin()
            },
            handler: () => {
                this.controller.modifyRank(1);
                this.game.addMessage('{0}\'s rank is increased by 1 thanks to the {1}. Current rank is {2}.', 
                    this.controller, this, this.controller.getTotalRank());
            }
        });
    }
}

BartonEverest.code = '01040';

module.exports = BartonEverest;
