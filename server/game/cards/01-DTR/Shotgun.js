const GameActions = require('../../GameActions/index.js');
const GoodsCard = require('../../goodscard.js');

class Shotgun extends GoodsCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Shotgun',
            playType: 'shootout',
            cost: ability.costs.bootSelf(),
            target: {
                cardCondition: { location: 'play area', controller: 'opponent', participating: true, 
                    condition: card => card.value <= this.parent.bullets
                },
                cardType: 'dude'
            },
            message: context =>
                this.game.addMessage('{0} plays {1} to ace {2}', this.controller, this, context.target),
            handler: context => {
                this.game.resolveGameAction(GameActions.aceCard({ card: context.target }), context);
            }
        });
    }
}

Shotgun.code = '01084';

module.exports = Shotgun;
