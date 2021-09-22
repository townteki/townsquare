const GoodsCard = require('../../goodscard.js');

class WhiskeyFlask extends GoodsCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Whiskey Flask',
            playType: ['noon'],
            cost: [ 
                ability.costs.bootSelf(),
                ability.costs.bootParent(),
                ability.costs.discardFromHand()
            ],
            message: context => 
                this.game.addMessage('{0} uses {1}\'s {2} to discard {3} from hand and draw a card', 
                    context.player, this.parent, this, context.costs.discardFromHand),
            handler: context => {
                context.player.drawCardsToHand(1, context);
            }
        });
    }
}

WhiskeyFlask.code = '01085';

module.exports = WhiskeyFlask;
