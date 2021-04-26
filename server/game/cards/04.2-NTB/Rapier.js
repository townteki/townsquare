const GoodsCard = require('../../goodscard.js');

class Rapier extends GoodsCard {
    constructor(owner, cardData) {
        super(owner, cardData, true);
    }
    setupCardAbilities(ability) {
        this.whileAttached({
            effect: ability.effects.modifyValue(1)
        });
    }
}

Rapier.code = '07015';

module.exports = Rapier;
