const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');
const StandardActions = require('../../PlayActions/StandardActions.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class DrJTGoodenough extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.reaction({
            title: 'React: Dr. JT Goodenough',
            grifter: true,
            cost: ability.costs.bootSelf(),
            handler: context => {
                this.game.resolveGameAction(
                    GameActions.search({
                        title: 'Select 2 different Weapons',
                        match: { 
                            allKeywords: ['gadget', 'weapon'], 
                            not: { keyword: 'unique' },
                            condition: (card, context) => this.isNotAlreadySelected(card, context)
                        },
                        location: ['draw deck'],
                        numToSelect: 2,
                        mode: 'exact',
                        message: {
                            format: '{player} plays {source} to search their draw deck and let opponent choose between {searchTarget}'
                        },
                        cancelMessage: {
                            format: '{player} plays {source} to search their draw deck, but does not select any Non-Unique Gadget Weapon'
                        },
                        handler: selectedWeapons => {
                            const revealFunc = card => selectedWeapons.includes(card);
                            this.game.cardVisibility.addRule(revealFunc);
                            const choosingPlayer = this.game.getNumberOfPlayers() === 1 ? context.player : context.player.getOpponent();
                            this.game.promptForSelect(choosingPlayer, {
                                activePromptTitle: 'Choose a card to discard',
                                cardCondition: card => selectedWeapons.includes(card),
                                onSelect: (player, weaponToDiscard) => {
                                    const weaponToAttach = selectedWeapons.reduce((keep, weapon) => {
                                        return weapon !== weaponToDiscard ? weapon : keep;
                                    });
                                    this.game.resolveGameAction(GameActions.discardCard({ card: weaponToDiscard }), context).thenExecute(() => {
                                        this.game.addMessage('{0} chooses to discard {1} as a result of {2}\'s ability', player, weaponToDiscard, this);
                                    });
                                    this.game.promptForSelect(context.player, {
                                        activePromptTitle: 'Select a dude for Weapon',
                                        cardCondition: card => card.location === 'play area' &&
                                                card.controller === this.controller,
                                        cardType: 'dude',
                                        onSelect: (player, dude) => {
                                            this.lastingEffect(context.ability, ability => ({
                                                until: {
                                                    onDrJTGoodenoughFinished: () => true
                                                },
                                                match: weaponToAttach,
                                                targetLocation: weaponToAttach.location,
                                                effect: ability.effects.doesNotHaveToBeInvented()
                                            }));                                                  
                                            this.game.resolveStandardAbility(StandardActions.putIntoPlay({
                                                playType: 'ability',
                                                abilitySourceType: 'card',
                                                targetParent: dude
                                            }), player, weaponToAttach);                                         
                                            return true;
                                        },
                                        source: this
                                    });                                     
                                    return true;
                                },
                                source: this
                            });
                            context.player.discardFromHand(1, discarded => 
                                this.game.addMessage('{0} uses {1} to discard {2} from their hand', context.player, this, discarded),
                            { 
                                title: this.title
                            }, context);                          
                            this.game.queueSimpleStep(() => {
                                this.game.cardVisibility.removeRule(revealFunc);
                                context.player.shuffleDrawDeck();
                                this.game.raiseEvent('onDrJTGoodenoughFinished'); 
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

DrJTGoodenough.code = '23017';

module.exports = DrJTGoodenough;
