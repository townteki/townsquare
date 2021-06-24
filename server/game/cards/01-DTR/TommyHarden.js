const DudeCard = require('../../dudecard.js');

class TommyHarden extends DudeCard {
    setupCardAbilities() {
        this.traitReaction({
            when: {
                onDrawHandsRevealed: event => event.shootout && this.isParticipating() && this.controller.getOpponent().isCheatin()
            },
            handler: context => {
                let rankMod = 2;
                if(context.player.isCheatin()) {
                    rankMod = 1;
                }
                context.player.modifyRank(rankMod, context);
                this.game.addMessage('{0}\'s rank is increased by {1} thanks to the {2}; Current rank is {3}', 
                    context.player, rankMod, this, context.player.getTotalRank());
            }
        });
    }
}

TommyHarden.code = '01018';

module.exports = TommyHarden;
