const GoodsCard = require('../../goodscard.js');

class Rapier extends GoodsCard {
    setupCardAbilities(ability) {
        this.meleeWeaponEffect(ability);
        this.whileAttached({
            condition: () => true,
            effect: ability.effects.modifyValue(1)
        });
    }
}

Rapier.code = '07015';

module.exports = Rapier;
