const DudeCard = require('../../dudecard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class WeiXu extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.isParticipating(),
            match: this,
            effect: [
                ability.effects.modifyInfluence(2),
                ability.effects.modifyValue(5)
            ]
        });
    }
}

WeiXu.code = '18010';

module.exports = WeiXu;
