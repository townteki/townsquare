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
                this.game.addMessage('{0} uses {1} to start a job marking {2}.', context.player, this, context.target);
            },
            onSuccess: (job, context) => {
                this.game.resolveGameAction(
                    GameActions.search({
                        title: 'Select a dude or deed',
                        match: { type: ['dude', 'deed'] },
                        location: ['discard pile'],
                        numToSelect: 1,
                        message: {
                            format: '{player} plays {source} to search their discard pile, and put {searchTarget} into play'
                        },
                        cancelMessage: {
                            format: '{player} plays {source} to search their discard pile, but does not find a dude or deed'
                        },
                        handler: card => {
                            if(card.cost >= 3) {
                                this.game.resolveStandardAbility(StandardActions.putIntoPlayWithReduction(2), context.player, card);
                            }
                            if(card.cost === 2) {
                                this.game.resolveStandardAbility(StandardActions.putIntoPlayWithReduction(1), context.player, card);
                            }
                            if(card.cost === 1) {
                                this.game.resolveStandardAbility(StandardActions.putIntoPlayWithReduction(0), context.player, card);
                            }
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
