const DudeCard = require('../../dudecard.js');

class WalterJameson extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.location === 'play area' && this.locationCard &&
                this.locationCard.owner !== this.controller && this.isAtDeed(),
            match: this,
            effect: ability.effects.modifyInfluence(1)
        });
    }
}

WalterJameson.code = '24091';

module.exports = WalterJameson;
