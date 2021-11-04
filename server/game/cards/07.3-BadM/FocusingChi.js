const GameActions = require('../../GameActions');
const TechniqueCard = require('../../techniquecard');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class FocusingChi extends TechniqueCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities() {
        this.traitReaction({
            location: 'being played',
            ignoreActionCosts: true,
            when: {
                onCardPulled: event => event.props.source && event.props.source.hasKeyword('technique') &&
                    event.card === this
            },
            handler: context => {
                const kfDude = context.event.props.pullingDude;
                if(kfDude.booted) {
                    this.game.promptForYesNo(context.player, {
                        title: `Do you want to unboot ${kfDude.title}`,
                        onYes: player => {
                            this.game.resolveGameAction(GameActions.unbootCard({
                                card: kfDude
                            }), context).thenExecute(() =>
                                this.game.addMessage('{0}\'s dude {1} is unbooted thanks to {2}', player, kfDude, this));
                        },
                        source: this
                    });
                }
                this.game.resolveGameAction(
                    GameActions.search({
                        title: 'Select up to 3 cards to discard',
                        topCards: 3,
                        location: ['draw deck'],
                        numToSelect: 3,
                        doNotShuffleDeck: true,
                        message: {
                            format: '{player} plays {source} and looks at top 3 cards of their deck to discard {searchTarget}'
                        },
                        cancelMessage: {
                            format: '{player} plays {source} and looks at top 3 cards of their deck, but does not discard any of them'
                        },
                        handler: (cards, searchContext) => {
                            context.player.discardCards(cards, false, () => true, {}, searchContext);
                        }
                    }),
                    context
                );
            }
        });

        this.techniqueAction({
            title: 'Noon/Shootout: Focusing Chi',
            playType: ['noon', 'shootout'],
            onSuccess: (context) => {
                this.abilityContext = context;
                this.game.promptWithMenu(context.player, this, {
                    activePrompt: {
                        menuTitle: 'Choose one option',
                        buttons: [
                            { text: 'Place on top of deck', method: 'focusingOption', arg: 'putOnTop' },
                            { text: 'Draw a card', method: 'focusingOption', arg: 'drawCard' }
                        ]
                    },
                    source: this
                });
            },
            source: this
        });
    }

    focusingOption(player, arg) {
        if(arg === 'putOnTop') {
            player.moveCardToTopOfDeck(this);
            this.game.addMessage('{0} uses {1} to put it on top of their deck', player, this);
        }
        if(arg === 'drawCard') {
            player.drawCardsToHand(1, this.abilityContext).thenExecute(() => 
                this.game.addMessage('{0} uses {1} to draw a card', player, this));
        }
        return true;
    }
}

FocusingChi.code = '13018';

module.exports = FocusingChi;
