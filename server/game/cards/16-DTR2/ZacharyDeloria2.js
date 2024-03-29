const DudeCard = require('../../dudecard.js');

class ZacharyDeloria2 extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.isInTownSquare(),
            match: this,
            effect: ability.effects.modifyInfluence(1)
        });
        this.persistentEffect({
            condition: () => this.controller.outfit.gang_code === '1stpeoples',
            match: this,
            effect: ability.effects.dynamicBullets(() => this.getHighestInfluenceHere())
        });
    }

    getHighestInfluenceHere() {
        const gameLocation = this.getGameLocation();
        const dudesHere = gameLocation ? gameLocation.getDudes() : [];
        return dudesHere.reduce((memo, dude) => dude.influence > memo ? dude.influence : memo, 0);
    }
}

ZacharyDeloria2.code = '25051';

module.exports = ZacharyDeloria2;
