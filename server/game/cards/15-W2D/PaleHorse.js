const GameActions = require('../../GameActions/index.js');
const GoodsCard = require('../../goodscard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class PaleHorse extends GoodsCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.action({
            title: 'Cheatin\' Resolution: Pale Horse',
            playType: ['cheatin resolution'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose dude to send home',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'opponent', 
                    participating: true,
                    condition: card => !card.hasHorse() 
                },
                cardType: ['dude'],
                gameAction: ['sendHome', 'boot'],
                ifAble: true
            },
            handler: context => {
                if(context.target) {
                    this.game.resolveGameAction(GameActions.sendHome({ card: context.target }), context).thenExecute(() => {
                        this.game.addMessage('{0} uses {1} to send {2} home booted', context.player, this, context.target);
                    });
                } else if(context.player.isCheatin()) {
                    this.game.addMessage('{0} uses {1} but it does not do anything', context.player, this);
                }
                if(!context.player.isCheatin()) {
                    this.game.resolveGameAction(GameActions.decreaseCasualties({ 
                        player: context.player, 
                        amount: this.parent.bullets 
                    }), context).thenExecute(() => {
                        this.game.addMessage('{0} uses {1} to reduce their casualties by {2}', context.player, this, this.parent.bullets);
                    });
                }
            }
        });
    }
}

PaleHorse.code = '23039';

module.exports = PaleHorse;
