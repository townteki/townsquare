const DudeCard = require('../../dudecard.js');

class JacquelineIsham extends DudeCard {
    setupCardAbilities() {
        this.traitReaction({
            when: {
                onDudeJoinedPosse: event => !event.leaderPosse && event.card === this
            },
            repeatable: true,
            message: context =>
                context.game.addMessage('{0} uses {1} and makes her a stud.', this.controller, this),
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
