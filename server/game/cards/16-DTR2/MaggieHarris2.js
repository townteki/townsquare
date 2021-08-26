const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');
const StandardActions = require('../../PlayActions/StandardActions.js');

class MaggieHarris2 extends DudeCard {
    setupCardAbilities(ability) {
        this.job({
            title: 'Maggie Harris',
            playType: 'noon',
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose a location',
                choosingPlayer: 'current',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'any',
                    condition: card => card.gamelocation !== this.gamelocation && !card.isOutOfTown()
                },
                cardType: ['location']
            },
            message: context =>
                this.game.addMessage('{0} plays {1} on {2}.', context.player, this, context.target),
            onSuccess: (job, context) => {
                this.game.resolveGameAction(
                    GameActions.search({
                        title: 'Choose a horse',
                        match: { keyword: 'Horse', type: 'goods' },
                        location: ['discard pile'],
                        numToSelect: 1,
                        message: {
                            format: '{player} plays {source} and searches their discard pile to put {searchTarget} into play'
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

MaggieHarris2.code = '25023';

module.exports = MaggieHarris2;
