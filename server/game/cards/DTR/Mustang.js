const GameActions = require('../../GameActions/index.js');
const GoodsCard = require('../../goodscard.js');

class Mustang extends GoodsCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Mustang',
            playType: 'noon',     
            cost: ability.costs.bootSelf(),  
            target: { cardType: 'location' },
            handler: context => {
                this.game.resolveGameAction(GameActions.moveDude({ card: this.parent, targetUuid: context.target.uuid, options: { removeAll: true } }), context);
                this.game.addMessage('{0} uses {1} with his rider {2} to move to {3}.', context.player, this, this.parent, context.target.title);
            }
        });
    }
}

Mustang.code = '01086';

module.exports = Mustang;
