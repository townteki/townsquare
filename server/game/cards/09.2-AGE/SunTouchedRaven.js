const GameActions = require('../../GameActions/index.js');
const SpellCard = require('../../spellcard.js');

class SunTouchedRaven extends SpellCard {
    setupCardAbilities(ability) {
        this.spellAction({
            title: 'Sun-Touched Raven',
            playType: 'shootout',
            cost: ability.costs.bootSelf(),
            difficulty: 6,
            onSuccess: (context) => {
                this.game.resolveGameAction(
                    GameActions.search({
                        title: 'Select up to 3 cards to discard',
                        topCards: 5,
                        location: ['draw deck'],
                        numToSelect: 3,
                        doNotShuffleDeck: true,
                        message: {
                            format: '{player} plays {source} and looks at top 5 cards of their deck to discard {searchTarget}'
                        },
                        cancelMessage: {
                            format: '{player} plays {source} and looks at top 5 cards of their deck, but does not discard any of them'
                        },
                        handler: (cards, searchContext) => {
                            context.player.discardCards(cards, false, () => true, {}, searchContext);
                        }
                    }),
                    context
                ).thenExecute(() => {
                    this.game.promptForYesNo(context.player, {
                        title: `Do you want to boot ${this.parent.title} to draw a card?`,
                        onYes: () => {
                            this.game.resolveGameAction(GameActions.bootCard({ card: this.parent }), context).thenExecute(() => {
                                this.game.resolveGameAction(GameActions.drawCards({ player: context.player, amount: 1 }), context).thenExecute(() => {
                                    this.game.addMessage('{0} uses {1} to boot {2} and draw a card', context.player, this, this.parent);
                                });
                            });
                        },
                        source: this
                    });
                });
            },
            source: this
        });
    }
}

SunTouchedRaven.code = '16016';

module.exports = SunTouchedRaven;
