const DudeCard = require('../../dudecard.js');

class JacquelineIsham2 extends DudeCard {
    setupCardAbilities() {
        this.traitReaction({
            when: {
                onDudeJoinedPosse: event => !event.leaderPosse && event.card === this
            },
            handler: context => {                
                this.untilEndOfShootoutPhase(context.ability, ability => ({
                    match: this,
                    effect: ability.effects.setAsStud()
                }));
            }
        });
    }
}

JacquelineIsham2.code = '24103';

module.exports = JacquelineIsham2;
