const DudeCard = require('../../dudecard.js');

class RamiroMendoza extends DudeCard {
    setupCardAbilities() {
        this.traitReaction({
            when: {
                onDudeJoinedPosse: event => event.card === this
            },
            handler: context => {
                // TODO M2 Ask if player wants to pay
                if(context.player.getSpendableGhostRock() >= 1) {
                    context.player.spendGhostRock(1);
                    this.game.addMessage('{0} has to pay 1 GR to {1} to make him join the posse.', this.controller, this);
                } else {
                    context.player.discardCard(this, false);
                    this.game.addMessage('{0} does not have 1 GR to pay to {1}, who leaves the town.', this.controller, this);
                }
            }
        });
    }
}

RamiroMendoza.code = '01047';

module.exports = RamiroMendoza;
