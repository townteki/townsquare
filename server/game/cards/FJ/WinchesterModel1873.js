const GoodsCard = require('../../goodscard.js');

class WinchesterModel1873 extends GoodsCard {
    setupCardAbilities(ability) {
        this.whileAttached({
            effect: ability.effects.modifyBullets(1)
        });
        this.action({
            title: 'Winchester Model 1873',
            playType: 'shootout',
            cost: [
                ability.costs.bootSelf(),
                ability.costs.bootParent()
            ],
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: this.parent,
                    effect: [
                        ability.effects.setAsStud(),
                        ability.effects.modifyBullets(1)
                    ]
                }));
                this.game.addMessage('{0} plays {1} to give {2} +1 bullets and make them a stud.', this.controller, this, this.parent);
            }
        });
    }
}

WinchesterModel1873.code = '06015';

module.exports = WinchesterModel1873;
