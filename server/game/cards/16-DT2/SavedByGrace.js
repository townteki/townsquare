const GameActions = require('../../GameActions/index.js');
const OutfitCard = require('../../outfitcard.js');

class SavedByGrace extends OutfitCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Noon: Saved By Grace',
            playType: ['noon'],
            cost: [
                ability.costs.bootSelf(),
                ability.costs.boot(card => card.location === 'play area' &&
                    card.controller === this.controller &&
                    card.getType() === 'dude' &&
                    card.hasKeyword('blessed') &&
                    !card.isAtHome())
            ],
            handler: context => {
                this.game.resolveGameAction(
                    GameActions.search({
                        title: 'Select a card to put to hand',
                        topCards: 4,
                        location: ['draw deck'],
                        numToSelect: 1,
                        doNotShuffleDeck: true,
                        message: {
                            format: '{player} uses {source} and boots {bootedDude} to look at top 4 cards of their deck',
                            args: { bootedDude: () => context.costs.boot }
                        },
                        cancelMessage: {
                            format: '{player} uses {source} and boots {bootedDude} to look at top 4 cards of their deck, but does not take any of them',
                            args: { bootedDude: () => context.costs.boot }
                        },
                        handler: (card, searchContext) => {
                            if(context.player.moveCardWithContext(card, 'hand', searchContext, true)) {
                                this.game.addMessage('{0} uses {1} to put {2} in their hand', context.player, this, card);
                            }
                        }
                    }),
                    context
                ).thenExecute(() => {
                    context.ability.selectAnotherTarget(context.player, context, {
                        activePromptTitle: 'Select a card to shuffle to deck',
                        cardCondition: card => card.controller === context.player && card.location === 'hand',
                        onSelect: (player, cardToShuffle) => {
                            if(context.player.moveCardWithContext(cardToShuffle, 'draw deck', context, true)) {
                                this.game.addMessage('{0} uses {1} to shuffle a card from their hand to deck', player, this);
                            }
                            player.shuffleDrawDeck();
                            return true;
                        },
                        onCancel: player => {
                            this.game.addMessage('{0} shuffles their deck as part of {1}\'s ability', player, this);
                            player.shuffleDrawDeck();
                        },
                        source: this
                    });
                });
            }
        });
    }
}

SavedByGrace.code = '24010';

module.exports = SavedByGrace;
