const DudeCard = require('../../dudecard.js');

class AuntLouMarchbanks extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.controller.equals(this.locationCard.owner),
            match: this,
            effect: ability.effects.setAsStud()
        });
    }
}

AuntLouMarchbanks.code = '23008';

module.exports = AuntLouMarchbanks;
