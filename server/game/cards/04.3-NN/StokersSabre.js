const GoodsCard = require('../../goodscard.js');
const GameActions = require('../../GameActions/index.js');

class StokersSabre extends GoodsCard {
    constructor(owner, cardData) {
        super(owner, cardData, { useMeleeEffect: true });
    }
    setupCardAbilities(ability) {
        this.whileAttached({
            effect: ability.effects.modifyValue(3)
        });

        this.action({
            title: 'Stoker\'s Sabre',
            playType: 'shootout',
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose spell',
                cardCondition: {
                    location: 'play area',
                    condition: card => card.parent === this && card.booted
                },
                cardType: ['spell']
            },
            message: context => this.game.addMessage('{0} uses {1} to refresh {2}\'s {3}',
                context.player, this, context.target.parent, context.target),
            handler: (context) => {
                context.target.resetAbilities();
                this.game.resolveGameAction(GameActions.unbootCard({ card: context.target }), context);
            }
        });
    }
}

StokersSabre.code = '08014';

module.exports = StokersSabre;
