const GameActions = require('../../GameActions/index.js');
const GoodsCard = require('../../goodscard.js');

class DisgenuineCurrencyPress extends GoodsCard {
    setupCardAbilities() {
        this.traitReaction({
            when: {
                onGadgetInvented: event => event.gadget === this
            },
            message: context => this.game.addMessage('{0} gains 5 GR and unboots {1} thanks to the {2}', context.player, context.event.scientist, this),
            handler: context => {
                context.player.modifyGhostRock(5);
                this.game.resolveGameAction(GameActions.unbootCard({ card: context.event.scientist }), context);
            }
        });
        this.traitReaction({
            triggerBefore: true,
            when: {
                onCardDiscarded: event => event.card === this && event.originalLocation === 'play area'
            },
            message: context => this.game.addMessage('{0} draws a card thanks to the {1}', context.player, this),
            handler: context => {
                this.owner.drawCardsToHand(1, context);
            }
        });
    }
}

DisgenuineCurrencyPress.code = '11016';

module.exports = DisgenuineCurrencyPress;
