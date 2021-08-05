const DudeCard = require('../../dudecard.js');

class MysteriousAimsSister extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => true,
            match: this,
            effect: ability.effects.dynamicInfluence(() => this.bounty > 4 ? 4 : this.bounty)
        });
    }
}

MysteriousAimsSister.code = '25078';

module.exports = MysteriousAimsSister;
