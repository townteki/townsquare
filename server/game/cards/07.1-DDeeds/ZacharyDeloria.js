const Factions = require('../../Constants/Factions.js');
const DudeCard = require('../../dudecard.js');

class ZacharyDeloria extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.controller.getFaction() === Factions.FirstPeoples,
            match: this,
            effect: ability.effects.dynamicBullets(() => this.getHighestInfluenceHere())
        });
    }

    getHighestInfluenceHere() {
        const gameLocation = this.getGameLocation();
        const dudesHere = gameLocation ? gameLocation.getDudes(dude => dude.controller === this.controller) : [];
        return dudesHere.reduce((memo, dude) => dude.influence > memo ? dude.influence : memo, 0);
    }
}

ZacharyDeloria.code = '11007';

module.exports = ZacharyDeloria;
