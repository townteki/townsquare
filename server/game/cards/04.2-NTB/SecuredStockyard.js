const DeedCard = require('../../deedcard.js');

class SecuredStockyard extends DeedCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Secured Stockyard',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            message: context =>
                this.game.addMessage('{0} uses {1} to gain a GR', context.player, this),
            handler: context => {
                context.player.modifyGhostRock(1);
            }
        });
    }
}

SecuredStockyard.code = '07011';

module.exports = SecuredStockyard;
