const DudeCard = require('../../dudecard.js');

class JacquelineIsham extends DudeCard {
    setupCardAbilities() {
        this.reaction({
            when: {
                onDudeJoinedPosse: event => !event.leaderPosse && event.card === this
            },
            repeatable: true,
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: this,
                    effect: ability.effects.setAsStud()
                }));
                this.game.addMessage('{0} uses {1} and makes her a stud.', this.controller, this);
            }
        });
    }
}

JacquelineIsham.code = '07009';

module.exports = JacquelineIsham;
