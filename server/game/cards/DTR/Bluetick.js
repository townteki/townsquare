const GameActions = require('../../GameActions/index.js');
const GoodsCard = require('../../goodscard.js');

class Bluetick extends GoodsCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Bluetick',
            playType: 'noon',     
            cost: ability.costs.bootSelf(),  
            target: {
                activePromptTitle: 'Select wanted dude to chase',
                cardCondition: { location: 'play area', wanted: true },
                cardType: 'dude'
            },
            handler: context => {
                this.game.resolveGameAction(GameActions.moveDude({ card: this.parent, targetUuid: context.target.gamelocation, options: { removeAll: true } }), context);
                this.game.addMessage('{0} uses {1} with his master {2} to chase {3} in {4}.', context.player, this, this.parent, context.target, context.target.locationCard);
            }
        });
    }
}

Bluetick.code = '01082';

module.exports = Bluetick;
