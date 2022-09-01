const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');
const StandardActions = require('../../PlayActions/StandardActions.js');

class FranciscoRosales extends DudeCard {
    setupCardAbilities(ability) {
        this.job({
            title: 'Francisco Rosales',
            playType: 'noon',
            cost: ability.costs.bootSelf(),
            target: 'townsquare',
            message: context =>
                this.game.addMessage('{0} uses {1} to mark town square for a job', context.player, this),
            onSuccess: (job, context) => {
                this.game.resolveGameAction(
                    GameActions.search({
                        title: 'Select a horse or sidekick',
                        match: { keyword: ['Horse', 'sidekick'], type: ['goods', 'spell'] },
                        location: ['discard pile'],
                        numToSelect: 1,
                        message: {
                            format: '{player} plays {source} and searches their discard pile to put {searchTarget} into play'
                        },
                        cancelMessage: {
                            format: '{player} plays {source} and searches their discard pile, but does not find a horse or sidekick'
                        },
                        handler: card => {
                            this.game.resolveStandardAbility(StandardActions.putIntoPlayWithReduction(2), context.player, card);
                        }
                    }),
                    context
                );                
            }
        });
    }
}

FranciscoRosales.code = '14004';

module.exports = FranciscoRosales;
