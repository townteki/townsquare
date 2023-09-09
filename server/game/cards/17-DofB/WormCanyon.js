const DeedCard = require('../../deedcard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class WormCanyon extends DeedCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.action({
            title: 'Discard hand and gain GR',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            handler: context => {
                if(context.player.hand.length) {
                    context.player.discardCards(context.player.hand, discarded => {
                        context.player.modifyGhostRock(discarded.length);
                        this.game.addMessage('{0} uses {1} to discard {2} and gain {3} GR', 
                            context.player, this, discarded, discarded.length);
                    }, {}, context);
                } else {
                    this.game.addMessage('{0} uses {1}, but does not discard any cards', context.player, this);
                }
            }
        });
    }
}

WormCanyon.code = '25032';

module.exports = WormCanyon;
