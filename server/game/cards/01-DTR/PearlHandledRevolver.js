const GoodsCard = require('../../goodscard.js');

class PearlHandledRevolver extends GoodsCard {
    setupCardAbilities(ability) {
        this.whileAttached({
            effect: ability.effects.setAsStud()
        });
    }
}

PearlHandledRevolver.code = '01087';

module.exports = PearlHandledRevolver;
