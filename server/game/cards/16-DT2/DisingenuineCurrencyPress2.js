const GoodsCard = require('../../goodscard.js');

class DisingenuineCurrencyPress2 extends GoodsCard {
    setupCardAbilities() {
        this.traitReaction({
            when: {
                onGadgetInvented: event => this.equals(event.gadget)
            },
            message: context => this.game.addMessage('{0} gains 4 GR thanks to inventing the {1}', context.player, this),
            handler: context => {
                context.player.modifyGhostRock(4);
            }
        });
        this.traitReaction({
            triggerBefore: true,
            when: {
                onCardDiscarded: event => this.equals(event.card) && event.originalLocation === 'play area'
            },
            message: context => this.game.addMessage('{0} draws a card thanks to the {1}', context.player, this),
            handler: context => {
                this.owner.drawCardsToHand(1, context);
            }
        });
    }
}

DisingenuineCurrencyPress2.code = '24152';

module.exports = DisingenuineCurrencyPress2;
