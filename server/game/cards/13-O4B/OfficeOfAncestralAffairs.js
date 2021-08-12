const GameActions = require('../../GameActions/index.js');
const OutfitCard = require('../../outfitcard.js');
const StandardActions = require('../../PlayActions/StandardActions.js');

class OfficeOfAncestralAffairs extends OutfitCard {
    setupCardAbilities(ability) {
        this.job({
            title: 'Office of Ancestral Affairs',
            playType: 'noon',
            cost: ability.costs.bootLeader(),
            target: {
                activePromptTitle: 'Mark an in-town deed',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'any', 
                    condition: card => !card.isOutOfTown() && card.control < 2 
                },
                cardType: ['deed']
            },
            message: context => this.game.addMessage('{0} plays {1} on {2}', context.player, this, context.target),
            onSuccess: (job, context) => {
                if(job.mark.location !== 'play area') {
                    return;
                }
                job.mark.modifyControl(1);
                if(job.jobUnopposed) {
                    this.game.resolveGameAction(
                        GameActions.search({
                            title: 'Select a Totem',
                            match: { keyword: 'Totem', type: 'spell' },
                            location: ['discard pile'],
                            numToSelect: 1,
                            message: {
                                format: '{player} plays {source} to search their discard pile, and put {searchTarget} into play'
                            },
                            cancelMessage: {
                                format: '{player} plays {source} to search their discard pile, but does not find a Totem'
                            },
                            handler: card => {
                                this.game.resolveStandardAbility(StandardActions.putIntoPlay({
                                    playType: 'validityCheck',
                                    abilitySourceType: 'ability',
                                    targetParent: job.mark
                                }, () => {
                                    this.game.addMessage('{0} uses {1} to plant {2} at job mark {3}', context.player, this, card, job.mark);
                                }), context.player, card);
                            },
                            source: this
                        }),
                        context
                    );
                }
            }
        });
    }
}

OfficeOfAncestralAffairs.code = '21002';

module.exports = OfficeOfAncestralAffairs;
