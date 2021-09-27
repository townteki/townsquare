const GoodsCard = require('../../goodscard.js');
const GameActions = require('../../GameActions/index.js');

class AsyncoilGun extends DeedCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Asyncoil Gun',
            playType: ['shootout'],
            cost: ability.costs.bootSelf(),
            target: {
                cardCondition: {
                    location: 'play area',
                    controller: 'opponent',
                    participating: true, 
                    condition: card => card.value <= this.parent.bullets
                },
                cardType: 'dude'
            },
            message: context => this.game.addMessage('{0} points {1}\'s {2} at {3}', context.player, this.parent, this, context.target),
            handler: context => {
                context.player.pull((pulledCard, pulledValue, pulledSuit) => {
                    if(pulledSuit === 'Clubs') {
                        this.game.resolveGameAction(GameActions.discardCard({ card: this.parent }), context).thenExecute(() => {
                            this.game.addMessage('{0} blows up due to the pull being a club', this);
                        });
                    } else {
                        this.game.resolveGameAction(GameActions.discardCard({ card: context.target }), context).thenExecute(() => {
                            this.game.addMessage('{0} works and discards {1}', this, context.target);
                        });
                    }
                }, true, { context });
            }
        });
    }
}

AsyncoilGun.code = '07013';

module.exports = AsyncoilGun;
