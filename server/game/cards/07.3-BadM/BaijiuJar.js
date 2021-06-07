const GoodsCard = require('../../goodscard.js');

class BaijiuJar extends GoodsCard {
    setupCardAbilities(ability) {
        this.whileAttached({
            condition: () => this.parent.locationCard.hasKeyword('Saloon'),
            effect: [
                ability.effects.modifyValue(3),
                ability.effects.modifyInfluence(1)
            ]
        });
        this.action({
            title: 'Baijiu Jar',
            playType: ['shootout'],
            cost: [ 
                ability.costs.bootSelf(),
                ability.costs.discardMultipleFromHand(3)
            ],
            handler: context => {
                context.player.drawCardsToHand(4, context);
                this.game.addMessage('{0} uses {1} to discard three cards to draw four cards', context.player, this);
            }
        });
    }
}

BaijiuJar.code = '18026';

module.exports = BaijiuJar;
