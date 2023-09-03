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
                context.player.discardFromHand(context.player.hand.length, discarded => {
                    context.player.modifyGhostRock(discarded.length);
                    this.game.addMessage('{0} uses {1} to discard {2} and gain {3} GR', 
                        context.player, this, discarded, discarded.length);
                }, {}, context);
            }
        });
    }
}

WormCanyon.code = '25032';

module.exports = WormCanyon;
