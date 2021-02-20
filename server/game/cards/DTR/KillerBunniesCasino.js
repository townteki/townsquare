const DeedCard = require('../../deedcard.js');

class KillerBunniesCasino extends DeedCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => true,
            match: this.controller,
            effect: [
                ability.effects.modifySundownDiscard(1)
            ]
        });
    }
}

KillerBunniesCasino.code = '01065';

module.exports = KillerBunniesCasino;
