const GameActions = require('../../GameActions/index.js');
const GoodsCard = require('../../goodscard.js');

class WendysTeethkickers extends GoodsCard {
    setupCardAbilities(ability) {
        this.reaction({
            title: 'Wendy\'s Teethkickers',
            when: {
                onDudeSentHome: event => event.options.originalLocation === this.gamelocation && 
                    event.card.booted &&
                    event.card.controller !== this.controller,
                onDudeMoved: event => event.options.originalLocation === this.gamelocation &&
                    event.target === event.card.controller.getOutfitCard().uuid &&
                    event.card.booted &&
                    event.card.controller !== this.controller
            },
            cost: ability.costs.bootSelf(),
            actionContext: { card: this.parent, gameAction: 'unboot' },
            message: context => 
                this.game.addMessage('{0} uses {1} to give {2} +1 influence and unboot them', context.player, this, this.parent),
            handler: context => {
                this.untilEndOfRound(context.ability, ability => ({
                    match: this.parent,
                    effect: ability.effects.modifyInfluence(1)
                }));
                this.game.resolveGameAction(GameActions.unbootCard({ card: this.parent }), context);
            }
        });
    }
}

WendysTeethkickers.code = '10026';

module.exports = WendysTeethkickers;
