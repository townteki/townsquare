const GoodsCard = require('../../goodscard.js');

class StoneIdol extends GoodsCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Stone Idol',
            playType: ['noon', 'shootout'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Select dude to weaken',
                cardCondition: { 
                    location: 'play area',
                    controller: 'any', 
                    condition: card => !this.game.shootout ||
                        (this.parent && this.parent.isParticipating() && card.isParticipating())
                },
                cardType: 'dude'
            },
            message: context => this.game.addMessage('{0} uses {1} to lower {2}\'s value by 3',
                context.player, this, context.target),
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.target,
                    effect: ability.effects.modifyValue(-3)
                }));
            }

        });
    }
}

StoneIdol.code = '03016';

module.exports = StoneIdol;
