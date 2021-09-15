const GoodsCard = require('../../goodscard.js');

class FateDispenser extends GoodsCard {
    setupCardAbilities(ability) {
        this.attachmentRestriction(card => 
            card.controller === this.controller &&
            card.getType() === 'deed' &&
            !card.hasKeyword('out of town'));

        this.action({
            title: 'Noon: Fate Dispenser',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            condition: context => this.parent && this.parent.controller === context.player,
            ifCondition: context => context.player.handSize > context.player.hand.length,
            ifFailMessage: context =>
                this.game.addMessage('{0} uses {1} but it does not have any effect because they have too many cards in hand', 
                    context.player, this),
            message: context => this.game.addMessage('{0} uses {1} to draw a card', context.player, this),
            handler: context => {
                context.player.drawCardsToHand(1, context);
            }
        });
    }
}

FateDispenser.code = '08015';

module.exports = FateDispenser;
