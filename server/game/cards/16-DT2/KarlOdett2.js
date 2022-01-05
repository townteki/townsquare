const DudeCard = require('../../dudecard.js');

class KarlOdett2 extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.isNonAboInLocation(),
            match: this,
            effect: ability.effects.modifyInfluence(-3)
        });
    }

    isNonAboInLocation() {
        let gameLocation = this.getGameLocation();
        return gameLocation && 
            gameLocation.getDudes().some(dude => dude.controller === this.controller && !dude.hasKeyword('abomination'));
    }
}

KarlOdett2.code = '24033';

module.exports = KarlOdett2;
