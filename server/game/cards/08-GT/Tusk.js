const GoodsCard = require('../../goodscard.js');

class Tusk extends GoodsCard {
    setupCardAbilities() {
        this.traitReaction({
            when: {
                onCardEntersPlay: event => event.card === this
            },
            message: context => this.game.addMessage('{0} draws a card thanks to {1}', context.player, this),
            handler: context => {
                context.player.drawCardsToHand(1, context);
            }
        });
        this.traitReaction({
            when: {
                onAbilityTargetsResolution: event => event.ability.isCardAbility() && event.player === this.controller.getOpponent()
            },
            handler: context => {
                this.lastingEffect(context.ability, ability => ({
                    until: {
                        onCardAbilityResolved: event => event.ability === context.event.ability
                    },
                    match: this.parent,
                    effect: ability.effects.modifyValue(5)
                }));
            }
        });
    }
}

Tusk.code = '14024';

module.exports = Tusk;
