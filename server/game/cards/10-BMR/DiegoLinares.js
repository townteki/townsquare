const DudeCard = require('../../dudecard.js');

class DiegoLinares extends DudeCard {
    setupCardAbilities() {
        this.traitReaction({
            triggerBefore: true,
            when: {
                onGadgetInventing: event => event.gadget.hasOneOfKeywords(['horse', 'sidekick'])
            },
            handler: context => {
                this.lastingEffect(context.ability, ability => ({
                    until: {
                        onGadgetInventing: event => event.gadget === context.event.gadget
                    },
                    match: this,
                    effect: ability.effects.modifySkillRating('mad scientist', 4)
                }));
            }
        });
    }
}

DiegoLinares.code = '18017';

module.exports = DiegoLinares;
