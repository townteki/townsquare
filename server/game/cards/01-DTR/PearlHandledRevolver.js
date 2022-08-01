const GoodsCard = require('../../goodscard.js');

class PearlHandledRevolver extends GoodsCard {
    constructor(owner, cardData) {
        super(owner, cardData, { providesStudBonus: true });
    }
}

PearlHandledRevolver.code = '01087';

module.exports = PearlHandledRevolver;
