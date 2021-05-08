const GoodsCard = require('../../goodscard.js');

class FlameThrower extends GoodsCard {
    setupCardAbilities(ability) {
        this.whileAttached({
            condition: () => true,
            effect: [
                ability.effects.setAsStud()
            ]
        });
        this.action({
            title: 'Flame-Thrower',
            playType: ['shootout'],
            cost: [
                ability.costs.bootSelf(),
                ability.costs.payXGhostRock(() => 1, () => 3)
            ],
            actionContext: { card: this, gameAction: 'increaseBullets' },
            message: context => this.game.addMessage('{0} uses {1} to boost its bullets by {2}', 
                context.player, this, context.grCost),
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: this,
                    effect: [
                        ability.effects.modifyBullets(context.grCost)
                    ]
                }));
                this.applyAbilityEffect(context.ability, ability => ({
                    match: this.game.shootout,
                    effect: [
                        ability.effects.modifyLoserCasualties(1)
                    ]
                }));
            }
        });
    }
}

FlameThrower.code = '01091';

module.exports = FlameThrower;
