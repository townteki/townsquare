const DeedCard = require('../../deedcard.js');

class CarmichaelsLivery extends DeedCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.location === 'play area' && this.horseCheck(),
            match: this,
            effect: [
                ability.effects.modifyProduction(1),
                ability.effects.modifyControl(1)
            ]
        });
    }

    horseCheck() {
        const gameLocation = this.getGameLocation();
        if(!gameLocation) {
            return false;
        }

        return gameLocation.getDudes().find(dude => dude.hasHorse());
    }
}

CarmichaelsLivery.code = '23029';

module.exports = CarmichaelsLivery;
