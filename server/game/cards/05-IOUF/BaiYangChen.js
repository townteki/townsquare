const DudeCard = require('../../dudecard.js');

class BaiYangChen extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.isInOpponentsHome(),
            match: this,
            effect: ability.effects.modifyUpkeep(-1)
        });
        this.persistentEffect({
            condition: () => this.isInOpponentsHome(),
            match: this.controller,
            effect: ability.effects.modifyHandSize(2)
        });
    }
}

BaiYangChen.code = '09014';

module.exports = BaiYangChen;
