const GameActions = require('../../GameActions/index.js');
const GoodsCard = require('../../goodscard.js');

class Pinto extends GoodsCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Pinto',
            playType: 'shootout:join',     
            cost: ability.costs.bootSelf(),  
            message: context =>
                this.game.addMessage('{0} uses {1} with his rider {2} to join posse', context.player, this, this.parent),                
            handler: context => {
                this.game.resolveGameAction(GameActions.joinPosse({ card: this.parent }), context);
            }
        });
    }
}

Pinto.code = '01090';

module.exports = Pinto;
