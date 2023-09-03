const GoodsCard = require('../../goodscard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class RattlerHideCoat extends GoodsCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.whileAttached({
            effect: [
                ability.effects.modifyValue(3)
            ]
        });
        this.whileAttached({
            condition: () => this.parent.isAtDeed(),
            effect: [
                ability.effects.determineControlByBullets()
            ]
        });
    }
}

RattlerHideCoat.code = '25038';

module.exports = RattlerHideCoat;
