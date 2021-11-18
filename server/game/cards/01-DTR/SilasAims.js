const DudeCard = require('../../dudecard.js');

class SilasAims extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.isWanted(),
            match: this,
            effect: ability.effects.dynamicBullets(() => this.bounty)
        });
    }
}

SilasAims.code = '01043';

module.exports = SilasAims;
