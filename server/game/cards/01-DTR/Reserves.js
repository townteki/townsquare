const ActionCard = require('../../actioncard.js');

class Reserves extends ActionCard {
    setupCardAbilities() {
        this.action({
            title: 'Reserves',
            playType: 'noon',      
            message: context => 
                this.game.addMessage('{0} uses {1} to gain a GR', context.player, this),
            handler: context => {
                context.player.modifyGhostRock(1);
            }
        });
    }
}

Reserves.code = '01127';

module.exports = Reserves;
