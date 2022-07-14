const GameActions = require('../../GameActions/index.js');
const GoodsCard = require('../../goodscard.js');

class BuffaloRifle2 extends GoodsCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Buffalo Rifle',
            playType: ['shootout:join'],
            cost: ability.costs.bootSelf(),
            condition: () => this.game.shootout && this.game.shootout.shootoutLocation.isAdjacent(this.gamelocation),
            message: context => 
                this.game.addMessage('{0} uses {1} to join {2} to their posse from an adjacent location', context.player, this, this.parent),
            handler: context => {
                this.game.resolveGameAction(GameActions.joinPosse({ 
                    card: this.parent, 
                    options: {
                        moveToPosse: false,
                        allowBooted: true
                    }
                }), context);
            }
        });
    }
}

BuffaloRifle2.code = '24173';

module.exports = BuffaloRifle2;
