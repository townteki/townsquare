const DeedCard = require('../../deedcard.js');

class GomorraParish extends DeedCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Gomorra Parish',
            playType: ['noon'],
            cost: [
                ability.costs.bootSelf(),
                ability.costs.ace(card => card.location === 'hand' && card.controller === this.controller)
            ],
            message: context => 
                this.game.addMessage('{0} uses {1} and aces {2} from hand to gain 1 GR', context.player, this, context.costs.ace),
            handler: context => context.player.modifyGhostRock(1)
        });
    }
}

GomorraParish.code = '01057';

module.exports = GomorraParish;
