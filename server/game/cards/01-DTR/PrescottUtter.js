const DudeCard = require('../../dudecard.js');

class PrescottUtter extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            match: this,
            effect: [
                ability.effects.dynamicBullets(() => this.getNumberOfLawDogsAtCurrentLocation()),
                ability.effects.dynamicInfluence(() => this.getNumberOfLawDogsAtCurrentLocation())
            ]
        });
    }
    getNumberOfLawDogsAtCurrentLocation() {
        return this.game.getDudesAtLocation(this.gamelocation).filter(dude => dude.belongsToGang('lawdogs')).length;
    }
}

PrescottUtter.code = '01019';

module.exports = PrescottUtter;
