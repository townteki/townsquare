const GoodsCard = require('../../goodscard.js');

class TinStar2 extends GoodsCard {
    setupCardAbilities(ability) {
        this.whileAttached({
            effect: [
                ability.effects.addKeyword('Deputy'),
                ability.effects.calloutCannotBeRefused(this, dude => dude.isWanted())
            ]
        });
    }
}

TinStar2.code = '25206';

module.exports = TinStar2;
