const GoodsCard = require('../../goodscard.js');

class LeMatRevolver extends GoodsCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Cheatin\' Resolution',
            playType: 'cheatin resolution',
            cost: ability.costs.bootSelf(),
            handler: context => {
                if(context.player.modifyRank(this.parent.bullets, context)) {
                    this.game.addMessage('{0} uses {1} to increase their hand rank by {2}; Current hand rank is {3}', 
                        context.player, this, this.parent.bullets, context.player.getTotalRank());
                }
            }
        });
        this.action({
            title: 'Resolution',
            playType: 'resolution',
            cost: ability.costs.bootSelf(),
            condition: () => this.parent.isStud(),
            handler: context => {
                // if player does not have two pair, he cannot satisfy the condition of three pairs
                if(context.player.getHandRank().rank !== 3) {
                    this.game.addMessage('{0} uses {1} but does not have three pairs combining with the first card of discard pile', 
                        context.player, this);
                    return;    
                }
                let discardedCardValue = context.player.discardPile[0].value;
                let valueFound = false;
                for(let drawHandCard of context.player.drawHand) {
                    if(drawHandCard.value === discardedCardValue) {
                        if(!valueFound) {
                            valueFound = true;
                        } else {
                            this.game.addMessage('{0} uses {1} but does not have three pairs combining with the first card of discard pile', 
                                context.player, this);
                            return;                         
                        }
                    }
                }
                if(context.player.modifyRank(this.parent.bullets, context)) {
                    this.game.addMessage('{0} uses {1} to increase their hand rank by {2}; Current hand rank is {3}', 
                        context.player, this, this.parent.bullets, context.player.getTotalRank());
                }
            }
        });
    }
}

LeMatRevolver.code = '13014';

module.exports = LeMatRevolver;
