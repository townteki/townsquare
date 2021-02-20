const GoodsCard = require('../../goodscard.js');

class LeMatRevolver extends GoodsCard {
    setupCardAbilities(ability) {
        this.whileAttached({
            effect: ability.effects.modifyBullets(1)
        });
        this.action({
            title: 'Cheatin\' Resolution',
            playType: 'cheatin resolution',
            cost: ability.costs.bootSelf(),
            handler: () => {
                this.controller.modifyRank(this.parent.bullets);
                this.game.addMessage('{0} uses {1} to increase their hand rank by {2}. Current hand rank is {3}', 
                    this.controller, this, this.parent.bullets, this.controller.getTotalRank());
            }
        });
        this.action({
            title: 'Resolution',
            playType: 'resolution',
            cost: ability.costs.bootSelf(),
            condition: () => this.parent.isStud(),
            handler: () => {
                // if player does not have two pair, he cannot satisfy the condition of three pairs
                if(this.controller.getHandRank().rank !== 3) {
                    this.game.addMessage('{0} uses {1} but does not have three pairs combining with the first card of discard pile.', 
                        this.controller, this);
                    return;    
                }
                let discardedCardValue = this.controller.discardPile[0].value;
                let valueFound = false;
                for(let drawHandCard of this.controller.drawHand) {
                    if(drawHandCard.value === discardedCardValue) {
                        if(!valueFound) {
                            valueFound = true;
                        } else {
                            this.game.addMessage('{0} uses {1} but does not have three pairs combining with the first card of discard pile.', 
                                this.controller, this);
                            return;                         
                        }
                    }
                }
                this.controller.modifyRank(this.parent.bullets);
                this.game.addMessage('{0} uses {1} to increase their hand rank by {2}. Current hand rank is {3}', 
                    this.controller, this, this.parent.bullets, this.controller.getTotalRank());
            }
        });
    }
}

LeMatRevolver.code = '13014';

module.exports = LeMatRevolver;
