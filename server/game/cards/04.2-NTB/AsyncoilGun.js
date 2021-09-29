const GoodsCard = require('../../goodscard.js');
const GameActions = require('../../GameActions/index.js');

class AsyncoilGun extends GoodsCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Asyncoil Gun',
            playType: ['shootout'],
            cost: [
                ability.costs.bootSelf(),
                ability.costs.pull()
            ],
            target: {
                cardCondition: {
                    location: 'play area',
                    controller: 'opponent',
                    participating: true, 
                    condition: card => card.value <= this.parent.bullets
                },
                cardType: 'dude'
            },
            handler: context => {
                if(context.pull.pulledSuit.toLowerCase() === 'clubs') {
                    const saveParent = this.parent;
                    this.game.resolveGameAction(GameActions.discardCard({ card: this.parent }), context).thenExecute(() => {
                        this.game.addMessage('{0} uses {1} but it blows up and discards {2}', context.player, this, saveParent);
                    });
                } else {
                    this.game.resolveGameAction(GameActions.discardCard({ card: context.target }), context).thenExecute(() => {
                        this.game.addMessage('{0} uses {1} to discard {2}', context.player, this, context.target);
                    });
                }
            }
        });
    }
}

AsyncoilGun.code = '07013';

module.exports = AsyncoilGun;
