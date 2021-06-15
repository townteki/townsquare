const DudeCard = require('../../dudecard.js');

class AuntLouMarchbanks extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.locationCard.owner === this.controller,
            effect: ability.effects.setAsStud()
        });
    }
}

AuntLouMarchbanks.code = '23008';

module.exports = AuntLouMarchbanks;
