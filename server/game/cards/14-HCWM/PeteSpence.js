const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');
const StandardActions = require('../../PlayActions/StandardActions.js');

class PeteSpence extends DudeCard {
    setupCardAbilities(ability) {
        this.job({
            title: 'Pete Spence',
            playType: 'noon',
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Mark an in-town location other than Pete\'s current location',
                cardCondition: {
                    location: 'play area',
                    controller: 'any',
                    condition: card => !card.isOutOfTown() && card.gamelocation !== this.gamelocation
                },
                cardType: ['location', 'townsquare', 'outfit']
            },
            message: context =>
                this.game.addMessage('{0} plays {1} on {2}.', context.player, this, context.target),
            onSuccess: (job, context) => {
                this.game.resolveGameAction(
                    GameActions.search({
                        title: 'Select an Attire or Non-Unique Weapon for Pete to fetch',
                        match: { condition: card => card.hasKeyword('attire') || (card.hasKeyword('weapon') && !card.isUnique()) },
                        location: ['discard pile'],
                        numToSelect: 1,
                        message: {
                            format: '{player} plays {source} to search their discard pile, and puts {searchTarget} into play'
                        },
                        cancelMessage: {
                            format: '{player} plays {source} to search their discard pile, but does not find an Attire or Non-Unique Weapon'
                        },
                        handler: card => {
                            this.game.resolveStandardAbility(StandardActions.putIntoPlay({
                                booted: true
                            }, () => {
                                if(card.hasKeyword('weapon') && !card.parent.isWanted()) {
                                    this.game.resolveGameAction(GameActions.addBounty({ card: card.parent }, context));
                                    this.game.addMessage('{0}\'s bounty is raised by 1 from attaching {1}', card.parent, card);
                                }
                            }), context.player, card);
                        }
                    }),
                    context
                );                
            }
        });
    }
}

PeteSpence.code = '22026';

module.exports = PeteSpence;
