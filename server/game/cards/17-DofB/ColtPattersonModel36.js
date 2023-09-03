const GoodsCard = require('../../goodscard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class ColtPattersonModel36 extends GoodsCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.action({
            title: 'Add bullets and make a stud',
            playType: 'shootout',
            cost: [
                ability.costs.bootSelf()
            ],
            message: context =>
                this.game.addMessage('{0} plays {1} to give {2} +2 bullets and make them a stud', context.player, this, this.parent),
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: this.parent,
                    effect: [
                        ability.effects.setAsStud(),
                        ability.effects.modifyBullets(2)
                    ]
                }));
            }
        });
    }
}

ColtPattersonModel36.code = '25041';

module.exports = ColtPattersonModel36;
