const GoodsCard = require('../../goodscard.js');

class WinchesterModel1873 extends GoodsCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Winchester Model 1873',
            playType: 'shootout',
            cost: [
                ability.costs.bootSelf(),
                ability.costs.bootParent()
            ],
            message: context =>
                this.game.addMessage('{0} plays {1} to give {2} +1 bullets and make them a stud', context.player, this, this.parent),
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: this.parent,
                    effect: [
                        ability.effects.setAsStud(),
                        ability.effects.modifyBullets(1)
                    ]
                }));
            }
        });
    }
}

WinchesterModel1873.code = '06015';

module.exports = WinchesterModel1873;
