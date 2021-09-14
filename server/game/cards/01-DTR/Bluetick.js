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
            actionContext: { card: this.parent, gameAction: 'moveDude' },
            message: context => 
                this.game.addMessage('{0} uses {1} with its master {2} to chase {3} in {4}', context.player, this, this.parent, context.target, context.target.locationCard),
            handler: context => {
                this.game.resolveGameAction(GameActions.moveDude({ card: this.parent, targetUuid: context.target.gamelocation, options: { removeAll: true } }), context);
            }
        });
    }
}

Bluetick.code = '01082';

module.exports = Bluetick;
