const DudeCard = require('../../dudecard.js');

class WalterJameson extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.location === 'play area' && this.locationCard &&
                !this.controller.equals(this.locationCard.owner) && this.isAtDeed(),
            match: this,
            effect: ability.effects.modifyInfluence(1)
        });
    }
}

WalterJameson.code = '24091';

module.exports = WalterJameson;
