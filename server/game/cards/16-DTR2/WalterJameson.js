const DudeCard = require('../../dudecard.js');

class WalterJameson extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.location === 'play area' && this.locationCard &&
                this.locationCard.owner !== this.controller,
            match: this,
            effect: ability.effects.modifyInfluence(1)
        });
    }
}

WalterJameson.code = '25080';

module.exports = WalterJameson;
