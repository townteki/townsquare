const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');
const StandardActions = require('../../PlayActions/StandardActions.js');

class MaggieHarris extends DudeCard {
    setupCardAbilities(ability) {
        this.job({
            title: 'Maggie Harris',
            playType: 'noon',
            cost: ability.costs.bootSelf(),
            bootLeader: true,
            target: 'currentHome',
            handler: context => {
                this.game.addMessage('{0} plays {1} on {2}.', context.player, this, context.target);
            },
            onSuccess: (job, context) => {
                this.game.resolveGameAction(
                    GameActions.search({
                        title: 'Select a horse for Maggie to catch',
                        match: { keyword: 'Horse', type: 'goods' },
                        location: ['discard pile'],
                        numToSelect: 1,
                        message: {
                            format: '{player} plays {source} to search their discard pile, and put {searchTarget} into play'
                        },
                        cancelMessage: {
                            format: '{player} plays {source} to search their discard pile, but does not find a horse'
                        },
                        handler: card => {
                            this.game.resolveStandardAbility(StandardActions.putIntoPlayWithReduction(1), context.player, card);
                        }
                    }),
                    context
                );                
            }
        });
    }
}

MaggieHarris.code = '15005';

module.exports = MaggieHarris;
