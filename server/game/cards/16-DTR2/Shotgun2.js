const GameActions = require('../../GameActions/index.js');
const GoodsCard = require('../../goodscard.js');

class Shotgun2 extends GoodsCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Shotgun',
            playType: 'shootout',
            cost: ability.costs.bootSelf(),
            target: {
                cardCondition: { location: 'play area', controller: 'opponent', participating: true, 
                    condition: card => card.value < this.parent.bullets
                },
                cardType: 'dude',
                gameAction: 'ace'
            },
            message: context =>
                this.game.addMessage('{0} plays {1} to ace {2}', this.controller, this, context.target),
            handler: context => {
                this.game.resolveGameAction(GameActions.aceCard({ card: context.target }), context);
            }
        });
    }
}

Shotgun2.code = '25195';

module.exports = Shotgun2;
