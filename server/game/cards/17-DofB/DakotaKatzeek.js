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
            cost: ability.costs.bootSelf(),
            ifCondition: () => this.isAtDeed(),
            ifFailMessage: context => 
                this.game.addMessage('{0} uses {1}, but it fails because {1} is not at deed', context.player, this),
            handler: context => {
                context.player.discardFromHand(1, discarded => {
                    this.game.resolveGameAction(
                        GameActions.search({
                            title: 'Select a Totem',
                            match: { keyword: 'Totem', type: 'spell' },
                            location: ['discard pile'],
                            numToSelect: 1,
                            message: {
                                format: '{player} uses {source}, discards {discarded} and searches their discard pile selecting {searchTarget}',
                                args: { discarded: () => discarded }
                            },
                            cancelMessage: {
                                format: '{player} uses {source}, discards {discarded} and searches their discard pile, but does not find a Totem',
                                args: { discarded: () => discarded }
                            },
                            handler: card => {
                                this.game.resolveStandardAbility(StandardActions.putIntoPlay({
                                    playType: 'ability',
                                    abilitySourceType: 'card',
                                    targetParent: this.locationCard
                                }), context.player, card);
                            },
                            source: this
                        }),
                        context
                    );    
                }, {}, context);
            }
        });
    }
}

DakotaKatzeek.code = '25015';

module.exports = DakotaKatzeek;
