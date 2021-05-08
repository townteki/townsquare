const GoodsCard = require('../../goodscard.js');

class FancyNewHat extends GoodsCard {
    setupCardAbilities(ability) {
        this.whileAttached({
            effect: ability.effects.cannotDecreaseInfluence('opponent', context => 
                context.ability && context.ability.isCardAbility())
        });
    }
}

FancyNewHat.code = '06016';

module.exports = FancyNewHat;
