const Factions = require('../../Constants/Factions.js');
const DudeCard = require('../../dudecard.js');

class ZacharyDeloria2 extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.isInTownSquare(),
            match: this,
            effect: ability.effects.modifyInfluence(1)
        });
        this.persistentEffect({
            condition: () => this.controller.getFaction() === Factions.FirstPeoples,
            match: this,
            effect: ability.effects.dynamicBullets(() => this.getHighestInfluenceHere())
        });
    }

    getHighestInfluenceHere() {
        const gameLocation = this.getGameLocation();
        const dudesHere = gameLocation ? gameLocation.getDudes(dude => dude.controller.equals(this.controller)) : [];
        return dudesHere.reduce((memo, dude) => dude.influence > memo ? dude.influence : memo, 0);
    }
}

ZacharyDeloria2.code = '24060';

module.exports = ZacharyDeloria2;
