const DudeCard = require('../../dudecard.js');

class MaFlorenceAims extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => true,
            match: this,
            effect: ability.effects.dynamicInfluence(() => this.bounty > 4 ? 4 : this.bounty)
        });
    }
}

MaFlorenceAims.code = '24084';

module.exports = MaFlorenceAims;
