const GoodsCard = require('../../goodscard.js');

class TinStar extends GoodsCard {
    setupCardAbilities(ability) {
        this.whileAttached({
            effect: ability.effects.calloutCannotBeRefused(this, dude => dude.isWanted())
        });
    }
}

TinStar.code = '01095';

module.exports = TinStar;
