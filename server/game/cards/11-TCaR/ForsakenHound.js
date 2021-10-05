const GoodsCard = require('../../goodscard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class ForsakenHound extends GoodsCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.action({
            title: 'Resolution: Forsaken Hound',
            playType: ['resolution'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose dude',
                cardCondition: { location: 'play area', controller: 'opponent', participating: true },
                cardType: ['dude']
            },
            message: context => 
                this.game.addMessage('{0} uses {1} to prevent both {2} and {3} from fleeing this round', 
                    context.player, this, this.parent, context.target),
            handler: context => {
                this.untilEndOfShootoutRound(context.ability, ability => ({
                    match: this.parent,
                    effect: ability.effects.cannotFlee()
                }));
                this.untilEndOfShootoutRound(context.ability, ability => ({
                    match: context.target,
                    effect: ability.effects.cannotFlee()
                }));
            }
        });
    }
}

ForsakenHound.code = '19031';

module.exports = ForsakenHound;
