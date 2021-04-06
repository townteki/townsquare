const GoodsCard = require('../../goodscard.js');

class YagnsMechanicalSkeleton extends GoodsCard {
    setupCardAbilities(ability) {
        this.whileAttached({
            effect: [
                ability.effects.addKeyword('Gadget'),
                ability.effects.modifyValue(3),
                ability.effects.cannotBeBooted('opponent'),
                ability.effects.cannotBeMoved('opponent')
            ]
        });
    }
}

YagnsMechanicalSkeleton.code = '13015';

module.exports = YagnsMechanicalSkeleton;
