const GoodsCard = require('../../goodscard.js');

class ForceField extends GoodsCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Resolution: Force Field',
            playType: ['resolution'],
            condition: () => this.getDiffInRanks() > 0,
            cost: ability.costs.payXGhostRock(() => 1, () => this.getDiffInRanks()),
            repeatable: true,
            handler: context => {
                context.player.modifyRank(context.grCost, context);
                this.game.addMessage('{0} uses {1} to raise their hand rank by {2}; Current rank is {3}', 
                    context.player, this, context.grCost, this.controller.getTotalRank());
            }
        });
    }

    getDiffInRanks() {
        if(this.game.getNumberOfPlayers() === 1) {
            return 0;
        }
        return this.controller.getOpponent().getTotalRank() - this.controller.getTotalRank();
    }
}

ForceField.code = '01092';

module.exports = ForceField;
