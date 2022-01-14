const GameActions = require('../../GameActions/index.js');
const GoodsCard = require('../../goodscard.js');

class StonesColtDragoons extends GoodsCard {
    setupCardAbilities(ability) {
        this.reaction({
            when: {
                onDudeJoinedPosse: event => 
                    event.card.controller !== this.controller && 
                    event.options.isCardEffect
            },
            cost: ability.costs.bootSelf(),
            message: context => 
                this.game.addMessage('{0} uses {1} to boot {2} who does not unboot at Nightfall', context.player, this, context.event.card),
            handler: context => {
                this.game.resolveGameAction(GameActions.bootCard({ card: context.event.card }), context);
                this.untilEndOfRound(context.ability, ability => ({
                    match: context.event.card,
                    effect: ability.effects.doesNotUnbootAtNightfall()
                }));
            }
        });
    }
}

StonesColtDragoons.code = '20042';

module.exports = StonesColtDragoons;
