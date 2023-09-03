const GoodsCard = require('../../goodscard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class FathersCross extends GoodsCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.whileAttached({
            condition: () => this.parent.hasKeyword('blessed'),
            effect: [
                ability.effects.modifySkillRating('blessed', 1)
            ]
        });
    }
}

FathersCross.code = '25037';

module.exports = FathersCross;
