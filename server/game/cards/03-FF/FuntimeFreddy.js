const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');
const StandardActions = require('../../PlayActions/StandardActions.js');

class FuntimeFreddy extends DudeCard {
    setupCardAbilities(ability) {
        this.reaction({
            title: 'React: Funtime Freddy',
            grifter: true,
            cost: ability.costs.bootSelf(),
            handler: context => {
                this.game.resolveGameAction(GameActions.aceCard({ card: this }), context);
                this.game.resolveGameAction(
                    GameActions.search({
                        title: 'Select 2 different Hexes',
                        match: { 
                            keyword: 'Hex', 
                            type: 'spell',
                            condition: (card, context) => this.isNotAlreadySelected(card, context)
                        },
                        location: ['draw deck'],
                        numToSelect: 2,
                        message: {
                            format: '{player} aces {source} to search their draw deck and let opponent choose between {searchTarget}'
                        },
                        cancelMessage: {
                            format: '{player} aces {source} to search their draw deck, but does not select any Hex'
                        },
                        handler: selectedHexes => {
                            const revealFunc = card => selectedHexes.includes(card);
                            this.game.cardVisibility.addRule(revealFunc);
                            const choosingPlayer = this.game.getNumberOfPlayers() === 1 ? context.player : context.player.getOpponent();
                            this.game.promptForSelect(choosingPlayer, {
                                activePromptTitle: 'Choose a card to ace',
                                waitingPromptTitle: 'Waiting for opponent to select card to ace',
                                cardCondition: card => selectedHexes.includes(card),
                                onSelect: (player, hexToAce) => {
                                    const hexToAttach = selectedHexes.reduce((keep, hex) => {
                                        return hex !== hexToAce ? hex : keep;
                                    });
                                    this.game.resolveGameAction(GameActions.aceCard({ card: hexToAce }), context).thenExecute(() => {
                                        this.game.addMessage('{0} chooses to ace {1} as a result of {2}\'s ability', player, hexToAce, this);
                                        this.game.promptForSelect(context.player, {
                                            activePromptTitle: 'Select a dude for Hex',
                                            waitingPromptTitle: 'Waiting for opponent to select dude',
                                            cardCondition: card => card.location === 'play area' &&
                                                    card.controller === this.controller &&
                                                    card.hasKeyword('huckster'),
                                            cardType: 'dude',
                                            onSelect: (player, huckster) => {
                                                this.game.resolveStandardAbility(StandardActions.putIntoPlay({
                                                    playType: 'ability',
                                                    abilitySourceType: 'card',
                                                    targetParent: huckster
                                                }), player, hexToAttach);  
                                                player.discardFromHand(1, discarded => 
                                                    this.game.addMessage('{0} discards {1} from their hand as a result of {2}\'s ability', player, discarded, this),
                                                { 
                                                    title: this.title
                                                }, context);                                                    
                                                return true;
                                            },
                                            source: this
                                        });
                                    });                                      
                                    return true;
                                },
                                source: this
                            });
                            this.game.queueSimpleStep(() => {
                                this.game.cardVisibility.removeRule(revealFunc);
                                context.player.shuffleDrawDeck();
                            });
                        }
                    }),
                    context
                ); 
            }
        });
    }

    isNotAlreadySelected(card, context) {
        const {selectedCards} = context;

        if(selectedCards.length === 0) {
            return true;
        }

        return !selectedCards.some(selectedCard => card.code === selectedCard.code);
    }
}

FuntimeFreddy.code = '06001';

module.exports = FuntimeFreddy;
