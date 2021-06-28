const DudeCard = require('../../dudecard.js');

class FlorentinoIndianCharlieCruz extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.isWanted(),
            match: this,
            effect: ability.effects.dynamicValue(() => this.bounty)
        });

        this.persistentEffect({
            condition: () => this.bounty > 3,
            match: this,
            effect: ability.effects.cannotBeSetToDraw()
        });
    }
}

FlorentinoIndianCharlieCruz.code = '22024';

module.exports = FlorentinoIndianCharlieCruz;
