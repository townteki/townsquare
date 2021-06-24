const DudeCard = require('../../dudecard.js');

class StevieLyndon extends DudeCard {
    setupCardAbilities() {
        this.traitReaction({
            triggerBefore: true,
            when: {
                onCardAbilityInitiated: event => event.source.parent === this && event.source.hasKeyword('hymn')
            },
            handler: context => {
                this.lastingEffect(context.ability, ability => ({
                    until: {
                        onCardAbilityResolved: event => event.ability === context.event.ability
                    },
                    match: this,
                    effect: ability.effects.modifySkillRating('blessed', 4)
                }));
            }
        });
    }
}

StevieLyndon.code = '18009';

module.exports = StevieLyndon;
