const DeedCard = require('../../deedcard.js');
const GameActions = require('../../GameActions/index.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class HeathsCuriosityShoppe extends DeedCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.action({
            title: 'Noon: Heath\'s Curiosity Shoppe',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            handler: context => {
                context.player.discardFromHand(2, discarded => {
                    this.game.resolveGameAction(
                        GameActions.search({
                            title: 'Select a card to put to hand',
                            match: { condition: card => 
                                !discarded.includes(card) &&
                                !card.isUnique() &&
                                (discarded[0].suit === card.suit && discarded[1].value === card.value ||
                                discarded[0].value === card.value && discarded[1].suit === card.suit)
                            },
                            location: ['discard pile'],
                            numToSelect: 1,
                            message: {
                                format: '{player} plays {source}, discards {discarded} and searches their discard pile to put {searchTarget} into their hand',
                                args: { discarded: () => discarded }
                            },
                            cancelMessage: {
                                format: '{player} plays {source}, discards {discarded} and searches their discard pile, but does not find any card',
                                args: { discarded: () => discarded }
                            },
                            handler: card => {
                                context.player.moveCardWithContext(card, 'hand', context, true);
                            },
                            source: this
                        }), context);
                }, { discardExactly: true }, context);
            }
        });
    }
}

HeathsCuriosityShoppe.code = '23031';

module.exports = HeathsCuriosityShoppe;
