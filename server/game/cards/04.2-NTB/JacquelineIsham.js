const DudeCard = require('../../dudecard.js');

class JacquelineIsham extends DudeCard {
    setupCardAbilities() {
        this.reaction({
            title: 'React: Jacqueline Isham',
            when: {
                onDudeJoinedPosse: event => !event.leaderPosse && event.card === this
            },
            repeatable: true,
            message: context =>
                this.game.addMessage('{0} uses {1} and makes {1} a stud', context.player, this),
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: this,
                    effect: ability.effects.setAsStud()
                }));
            },
            source: this
        });
    }
}

JacquelineIsham.code = '07009';

module.exports = JacquelineIsham;
