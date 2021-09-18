const DudeCard = require('../../dudecard.js');

class FredAims extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.isWanted(),
            match: this,
            effect: ability.effects.dynamicInfluence(() => this.bounty)
        });
    }
}

FredAims.code = '01036';

module.exports = FredAims;
