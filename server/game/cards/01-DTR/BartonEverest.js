const DudeCard = require('../../dudecard.js');

class BartonEverest extends DudeCard {
    setupCardAbilities() {
        this.traitReaction({
            when: {
                onDrawHandsRevealed: event => event.shootout && this.isParticipating() && this.controller.isCheatin()
            },
            handler: context => {
                context.player.modifyRank(1, context);
                this.game.addMessage('{0}\'s rank is increased by 1 thanks to the {1}; Current rank is {2}', 
                    context.player, this, context.player.getTotalRank());
            }
        });
    }
}

BartonEverest.code = '01040';

module.exports = BartonEverest;
