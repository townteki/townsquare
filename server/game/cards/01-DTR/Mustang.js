const GameActions = require('../../GameActions/index.js');
const GoodsCard = require('../../goodscard.js');

class Mustang extends GoodsCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Mustang',
            playType: 'noon',     
            cost: ability.costs.bootSelf(),  
            target: { cardType: 'location' },
            actionContext: { card: this.parent, gameAction: 'moveDude' },
            message: context => 
                this.game.addMessage('{0} uses {1} with his rider {2} to move to {3}', context.player, this, this.parent, context.target.title),
            handler: context => {
                this.game.resolveGameAction(GameActions.moveDude({ card: this.parent, targetUuid: context.target.uuid }), context);
            }
        });
    }
}

Mustang.code = '01086';

module.exports = Mustang;
