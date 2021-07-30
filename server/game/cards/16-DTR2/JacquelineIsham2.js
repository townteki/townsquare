const DudeCard = require('../../dudecard.js');

class JacquelineIsham2 extends DudeCard {
    setupCardAbilities() {
        this.traitReaction({
            when: {
                onDudeJoinedPosse: event => !event.leaderPosse && event.card === this
            },
            handler: () => {                
                this.untilEndOfShootoutPhase(ability => ({
                    match: this,
                    effect: ability.effects.setAsStud()
                }));
            }
        });
    }
}

JacquelineIsham2.code = '25091';

module.exports = JacquelineIsham2;
