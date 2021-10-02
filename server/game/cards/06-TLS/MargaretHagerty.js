const DudeCard = require('../../dudecard.js');

class MargaretHagerty extends DudeCard {
    setupCardAbilities(ability) {
        this.traitReaction({
            triggerBefore: true,
            when: {
                onGadgetInventing: event => event.scientist === this &&
                    event.gadget.getType() === 'dude'
            },
            handler: context => {
                this.lastingEffect(context.ability, ability => ({
                    until: {
                        onGadgetInventing: event => event.gadget === context.event.gadget
                    },
                    match: this,
                    effect: ability.effects.modifySkillRating('mad scientist', 3)
                }));
            }
        });
        this.persistentEffect({
            targetController: 'any',
            condition: () => true,
            match: card => card.getType() === 'dude' &&
                card.hasKeyword('gadget') &&
                card.gamelocation === this.gamelocation,
            effect: ability.effects.modifyUpkeep(-1)
        });
    }
}

MargaretHagerty.code = '10018';

module.exports = MargaretHagerty;
