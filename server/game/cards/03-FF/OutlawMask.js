const GoodsCard = require('../../goodscard.js');

class OutlawMask extends GoodsCard {
    setupCardAbilities(ability) {
        this.whileAttached({
            condition: () => this.parent.isInTownSquare() && this.parent.isWanted(),
            effect: ability.effects.dynamicInfluence(() => this.parent.bounty)
        });
    }
}

OutlawMask.code = '05024';

module.exports = OutlawMask;
