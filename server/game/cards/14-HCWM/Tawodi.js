const DudeCard = require('../../dudecard.js');
const StandardActions = require('../../PlayActions/StandardActions.js');
const GameActions = require('../../GameActions/index.js');

class Tawodi extends DudeCard {
    setupCardAbilities(ability) {
        this.job({
            title: 'Tawodi',
            playType: 'noon',
            cost: ability.costs.bootSelf(),
            target: 'townsquare',
            message: context => {
                this.game.addMessage('{0} uses {1} to start a job marking {2}', context.player, this, context.target);
            },
            onSuccess: (job, context) => {
                this.game.resolveGameAction(
                    GameActions.search({
                        title: 'Select a dude or deed',
                        match: { type: ['dude', 'deed'] },
                        location: ['discard pile'],
                        numToSelect: 1,
                        message: {
                            format: '{player} plays {source} and searches their discard pile to put {searchTarget} into play'
                        },
                        cancelMessage: {
                            format: '{player} plays {source} and searches their discard pile, but does not find a dude or deed'
                        },
                        handler: card => {
                            this.game.resolveStandardAbility(StandardActions.putIntoPlayWithReduction(2, 1), context.player, card);
                        }
                    }),
                    context
                );                
            }
        });
    }
}

Tawodi.code = '22016';

module.exports = Tawodi;
