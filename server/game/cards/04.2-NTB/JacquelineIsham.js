const DudeCard = require('../../dudecard.js');

class JacquelineIsham extends DudeCard {
    setupCardAbilities() {
        this.traitReaction({
            when: {
                onDudeJoinedPosse: event => !event.leaderPosse && event.card === this
            },
            message: context =>
                context.game.addMessage('{1} joins the posse and becomes a stud.', this),
            handler: () => {
                this.applyAbilityEffect(this.ability, ability => ({
                    match: this,
                    effect: ability.effects.setAsStud()
                }));
            }
        });
    }
}

JacquelineIsham.code = '07009';

module.exports = JacquelineIsham;
