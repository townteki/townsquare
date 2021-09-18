const DudeCard = require('../../dudecard.js');

class MarionSeville extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.isWanted(),
            match: this,
            effect: ability.effects.modifyBullets(2)
        });
    }
}

MarionSeville.code = '01038';

module.exports = MarionSeville;
