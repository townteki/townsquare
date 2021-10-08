const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');
const StandardActions = require('../../PlayActions/StandardActions.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class F1Burch extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities() {
        this.traitReaction({
            when: {
                onCardEntersPlay: event => event.card === this
            },
            handler: context => {
                this.game.promptForLocation(context.player, {
                    activePromptTitle: `Select where to move ${this.title}`,
                    waitingPromptTitle: 'Waiting for opponent to select location',
                    cardCondition: card => card.location === 'play area' &&
                        card.uuid !== this.gamelocation &&
                        !card.isOutOfTown() &&
                        this.game.getDudesAtLocation(card.uuid).some(dude => dude.controller === context.player),
                    onSelect: (player, location) => {
                        this.game.resolveGameAction(GameActions.moveDude({ 
                            card: this, 
                            targetUuid: location.uuid 
                        }), context).thenExecute(() => {
                            this.game.addMessage('{0} uses {1} to move him to {2}', player, this, location);
                            this.game.resolveGameAction(
                                GameActions.search({
                                    title: 'Select a Non-Unique and Non-Gadget goods',
                                    match: { condition: card => !card.hasKeyword('gadget') && !card.isUnique() },
                                    location: ['discard pile', 'hand'],
                                    numToSelect: 1,
                                    message: {
                                        format: '{player} plays {source} and searches their discard pile to puts {searchTarget} into play'
                                    },
                                    cancelMessage: {
                                        format: '{player} plays {source} and searches their discard pile, but does not find any Non-Unique and Non-Gadget goods'
                                    },
                                    handler: card => {
                                        this.game.resolveStandardAbility(StandardActions.putIntoPlay({
                                            playType: 'ability',
                                            abilitySourceType: 'card',
                                            reduceAmount: 1,
                                            targetLocationUuid: this.gamelocation
                                        }, () => {
                                            this.game.addMessage('{0} uses {1} to put {2} into play reducing its cost by 1', context.player, this, card);
                                        }), context.player, card);
                                    }, 
                                    source: this
                                }),
                                context
                            );                              
                        });
                        return true;
                    },
                    source: this
                });
            }
        });
    }
}

F1Burch.code = '19019';

module.exports = F1Burch;
