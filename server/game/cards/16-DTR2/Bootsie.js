const DudeCard = require('../../dudecard.js');

class Bootsie extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.location === 'play area' && this.locationCard &&
                this.locationCard.owner !== this.controller,
            match: this,
            effect: ability.effects.modifyInfluence(1)
        });
    }
}

Bootsie.code = '25080';

module.exports = Bootsie;
