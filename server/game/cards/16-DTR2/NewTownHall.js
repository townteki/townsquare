const DeedCard = require('../../deedcard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class NewTownHall extends DeedCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.action({
            title: 'Noon: Add a control point',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            message: context => 
                this.game.addMessage('{0} uses {1} to add a permanent control point to itself', 
                    context.player, this),
            handler: () => {
                this.modifyControl(1, true);
            }
        });

        this.action({
            title: 'Noon: Remove all control points',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            message: context => 
                this.game.addMessage('{0} uses {1} to remove all control points from itself', 
                    context.player, this),
            handler: () => {
                this.modifyControl(-this.control, true);
            }
        });
    }
}

NewTownHall.code = '25154';

module.exports = NewTownHall;
