const LegendCard = require('../../legendcard.js');

class LacyOMalley extends LegendCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            match: this.owner,
            effect: [
                ability.effects.cardsCannotLeaveDiscard(this, context => context.ability && 
                    context.ability.isCardAbility()),
                ability.effects.discardAllDuringSundown()
            ]
        });
    }
}

LacyOMalley.code = '22003';

module.exports = LacyOMalley;
