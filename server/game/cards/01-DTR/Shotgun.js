const GoodsCard = require('../../goodscard.js');

class Shotgun extends GoodsCard {
    setupCardAbilities(ability) {
        this.whileAttached({
            effect: ability.effects.modifyBullets(1)
        });
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
            handler: context => {
                context.target.controller.aceCard(context.target);
                this.game.addMessage('{0} plays {1} to ace {2}.', this.controller, this, context.target);
            }
        });
    }
}

Shotgun.code = '01084';

module.exports = Shotgun;
