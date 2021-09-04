const DudeCard = require('../../dudecard.js');

class LongweiFu extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.game.shootout && this.isAtHome(),
            match: this.controller,
            effect: ability.effects.modifyPosseStudBonus(1)
        });
    }
}

LongweiFu.code = '09007';

module.exports = LongweiFu;
