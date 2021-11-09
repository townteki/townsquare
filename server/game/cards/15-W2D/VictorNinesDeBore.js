const DudeCard = require('../../dudecard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class VictorNinesDeBore extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.persistentEffect({
            match: this,
            effect: ability.effects.dynamicSkillRating('huckster', () => this.getAbomsBonus())
        });
    }

    getAbomsBonus() {
        const abomsBonus = this.game.getDudesAtLocation(this.gamelocation, dude => 
            dude.hasKeyword('abomination')).length;
        return abomsBonus > 4 ? 4 : abomsBonus;
    }
}

VictorNinesDeBore.code = '23011';

module.exports = VictorNinesDeBore;
