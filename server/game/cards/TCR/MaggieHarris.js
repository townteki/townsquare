const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

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
                        match: {
                            location: ['discard pile'],
                            keyword: 'Horse', type: 'goods'
                        },
                        message: {
                            format: '{player} plays {source} to search their discard pile, and put {searchTarget} into play from their {searchTargetLocation}',
                            args: {
                                searchTargetLocation: context => context.searchTarget.location
                            }
                        },
                        cancelMessage: {
                            format: '{player} plays {source} to search their discard pile, but does not find a horse'
                        },
                        gameAction: GameActions.putIntoPlay(context => ({
                            player: context.player,
                            card: context.searchTarget
                        }))
                    }),
                    context
                );                
            }
        });
    }
}

MaggieHarris.code = '15005';

module.exports = MaggieHarris;
