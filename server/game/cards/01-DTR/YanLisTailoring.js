const DeedCard = require('../../deedcard.js');

class YanLisTailoring extends DeedCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Yan Li\'s Tailoring',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Select dude ot raise influence',
                cardCondition: { location: 'play area' },
                cardType: ['dude']
            },
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.target,
                    effect: ability.effects.modifyInfluence(1)
                }));
                this.game.addMessage('{0} uses {1} to raise influence for {2}.', context.player, this, context.target);
            }
        });
    }
}

YanLisTailoring.code = '01060';

module.exports = YanLisTailoring;
