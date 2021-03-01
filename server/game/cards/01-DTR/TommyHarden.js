const DudeCard = require('../../dudecard.js');

class TommyHarden extends DudeCard {
    setupCardAbilities() {
        this.traitReaction({
            when: {
                onDrawHandsRevealed: event => event.shootout && this.isParticipating() && this.controller.getOpponent().isCheatin()
            },
            handler: () => {
                let rankMod = 2;
                if(this.controller.isCheatin()) {
                    rankMod = 1;
                }
                this.controller.modifyRank(rankMod);
                this.game.addMessage('{0}\'s rank is increased by {1} thanks to the {2}. Current rank is {3}.', 
                    this.controller, rankMod, this, this.controller.getTotalRank());
            }
        });
    }
}

TommyHarden.code = '01018';

module.exports = TommyHarden;
