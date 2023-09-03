const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');
const StandardActions = require('../../PlayActions/StandardActions.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class DakotaKatzeek extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.action({
            title: 'Search for Totem',
            playType: ['noon'],
            cost: [
                ability.costs.bootSelf(),
                ability.costs.discardFromHand()
            ],
            ifCondition: () => this.isAtDeed(),
            ifFailMessage: context => 
                this.game.addMessage('{0} uses {1}, but it fails because {1} is not at deed', context.player, this),
            message: context => this.game.addMessage('{0} uses {1} to ', context.player, this),
            handler: context => {
                this.game.resolveGameAction(
                    GameActions.search({
                        title: 'Select a Totem',
                        match: { keyword: 'Totem', type: 'spell' },
                        location: ['discard pile'],
                        numToSelect: 1,
                        message: {
                            format: '{player} plays {source} and searches their discard pile to put {searchTarget} into play'
                        },
                        cancelMessage: {
                            format: '{player} plays {source} and searches their discard pile, but does not find a Totem'
                        },
                        handler: card => {
                            this.game.resolveStandardAbility(StandardActions.putIntoPlay({
                                playType: 'ability',
                                abilitySourceType: 'card',
                                targetParent: this.locationCard
                            }, () => {
                                this.game.addMessage('{0} uses {1} to plant {2} at {3}', context.player, this, card, this.locationCard);
                            }), context.player, card);
                        },
                        source: this
                    }),
                    context
                );                
            }
        });
    }
}

DakotaKatzeek.code = '25015';

module.exports = DakotaKatzeek;
