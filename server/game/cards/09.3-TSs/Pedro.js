const GoodsCard = require('../../goodscard.js');

class Pedro extends GoodsCard {
    setupCardAbilities(ability) {
        this.whileAttached({
            effect: [
                ability.effects.modifyValue(-3),
                ability.effects.cannotBeMovedViaCardEffects('opponent')
            ]
        });
    }
}

Pedro.code = '17013';

module.exports = Pedro;
