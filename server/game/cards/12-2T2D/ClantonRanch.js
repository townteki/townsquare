const DeedCard = require('../../deedcard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class ClantonRanch extends DeedCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.action({
            title: 'Noon: Clanton Ranch',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            ifCondition: () => !this.controller.firstPlayer,
            ifFailMessage: context =>
                this.game.addMessage('{0} uses {1}, but it fails because they are the Dealer (first player)', context.player, this),
            message: context => this.game.addMessage('{0} uses {1} to gain 1 GR', context.player, this),
            handler: context => {
                context.player.modifyGhostRock(1);
            }
        });
    }
}

ClantonRanch.code = '20032';

module.exports = ClantonRanch;
