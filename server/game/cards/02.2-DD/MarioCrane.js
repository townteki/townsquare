const DudeCard = require('../../dudecard.js');

class MarioCrane extends DudeCard {
    setupCardAbilities() {
        this.traitReaction({
            when: {
                onDrawHandsRevealed: event => event.shootout && this.isParticipating() && !this.controller.isCheatin()
            },
            handler: context => {
                this.lastingEffect(context.ability, ability => ({
                    until: {
                        onShootoutRoundFinished: () => true
                    },
                    match: this,
                    effect: ability.effects.cannotBeChosenAsCasualty(this,
                        card => card.controller.getOpponent().getTotalRank() - card.controller.getTotalRank() < 3)
                }));
            }
        });
    }
}

MarioCrane.code = '03010';

module.exports = MarioCrane;
