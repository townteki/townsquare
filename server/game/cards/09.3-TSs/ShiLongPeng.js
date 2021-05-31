const DudeCard = require('../../dudecard.js');

class ShiLongPeng extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            match: this,
            effect: ability.effects.canPerformTechniqueUsing('blessed')
        });
    }
}

ShiLongPeng.code = '17001';

module.exports = ShiLongPeng;
