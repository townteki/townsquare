const GoodsCard = require('../../goodscard.js');

class Tusk extends GoodsCard {
    constructor(owner, cardData) {
        super(owner, cardData);
        this.registerEvents(['onAbilityTargetsResolution']);
    }

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
    }

    onAbilityTargetsResolution(targetResEvent) {
        if(!targetResEvent.ability.isCardAbility() || targetResEvent.player !== this.controller.getOpponent() || 
            this.isFullBlank() || this.isTraitBlank()) {
            return;
        }
        this.lastingEffect(targetResEvent.ability, ability => ({
            until: {
                onCardAbilityResolved: event => event.ability === targetResEvent.ability
            },
            match: this.parent,
            effect: ability.effects.modifyValue(5)
        }));
    }
}

Tusk.code = '14024';

module.exports = Tusk;
