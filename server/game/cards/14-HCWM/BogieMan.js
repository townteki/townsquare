const DudeCard = require('../../dudecard.js');

class BogieMan extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.controller.deadPile.length === 0,
            match: this,
            effect: ability.effects.modifyInfluence(1)
        });

        this.persistentEffect({
            condition: () => this.controller.deadPile.length > 0,
            match: this,
            effect: ability.effects.dynamicBullets(() => this.findHighestInfInBootHill())
        });
    }

    findHighestInfInBootHill() {
        return this.controller.deadPile.reduce((max, card) => {
            if(card.getPrintedStat('influence') > max) {
                return card.getPrintedStat('influence');
            }
            return max;
        }, 0);
    }
}

BogieMan.code = '22014';

module.exports = BogieMan;
