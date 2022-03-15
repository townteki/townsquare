const DudeCard = require('../../dudecard.js');

class RamiroMendoza extends DudeCard {
    setupCardAbilities() {
        this.traitReaction({
            when: {
                onDudeJoinedPosse: event => event.card === this
            },
            handler: context => {
                if(context.player.getSpendableGhostRock() >= 1) {
                    this.game.promptForYesNo(context.player, {
                        title: 'Do you want to pay 1GR for Ramiro?',
                        onYes: player => {
                            player.spendGhostRock(1);
                            this.game.addMessage('{0} has to pay 1 GR to {1} to make him join the posse', player, this);                            
                        },
                        onNo: player => {
                            player.discardCard(this, false);
                            this.game.addMessage('{0} decides to not pay 1 GR to {1}, who leaves town', player, this);
                        },
                        source: this
                    });
                } else {
                    context.player.discardCard(this, false);
                    this.game.addMessage('{0} does not have 1 GR to pay to {1}, who leaves town', context.player, this);
                }
            }
        });
    }
}

RamiroMendoza.code = '01047';

module.exports = RamiroMendoza;
