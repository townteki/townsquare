const GoodsCard = require('../../goodscard.js');
const GameActions = require('../../GameActions/index.js');

class GuideHorse extends GoodsCard {
    setupCardAbilities(ability) {
        this.action({
            playType: 'noon',     
            cost: ability.costs.bootSelf(),  
            actionContext: { card: this.parent, gameAction: 'moveDude' },
            message: context => 
                this.game.addMessage('{0} uses {1} to have {2} move to town square', context.player, this, this.parent),
            handler: context => {
                this.game.resolveGameAction(GameActions.moveDude({ card: this.parent, targetUuid: this.game.townsquare.uuid }), context);
            }
        });
    }
}

GuideHorse.code = '12015';

module.exports = GuideHorse;
