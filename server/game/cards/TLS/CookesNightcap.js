const DeedCard = require('../../deedcard.js');

class CookesNightcap extends DeedCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.controller !== this.owner,
            match: this,
            effect: [
                ability.effects.setControl(2)
            ]
        });
    }
}

CookesNightcap.code = '10023';

module.exports = CookesNightcap;
