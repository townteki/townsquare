const ActionCard = require('../../actioncard.js');
const GameActions = require('../../GameActions/index.js');
const StandardActions = require('../../PlayActions/StandardActions.js');

class TechnologicalExhibition extends ActionCard {
    setupCardAbilities() {
        this.job({
            title: 'Technological Exhibition',
            playType: 'noon',
            target: {
                activePromptTitle: 'Mark an in-town location',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'any', 
                    condition: card => card.gamelocation === 'townsquare' || (card.isLocationCard() && !card.isOutOfTown()) 
                },
                cardType: ['location']
            },
            leaderCondition: card => card.hasKeyword('mad scientist'),
            message: context => this.game.addMessage('{0} plays {1} on {2}', context.player, this, context.target),
            onSuccess: (job, context) => {
                this.game.resolveGameAction(
                    GameActions.search({
                        title: 'Select a gadget to put into play',
                        match: { keyword: 'gadget', type: 'goods' },
                        location: ['hand', 'discard pile'],
                        numToSelect: 1,
                        message: {
                            format: '{player} plays {source} to search their discard pile and hand, and put {searchTarget} into play'
                        },
                        cancelMessage: {
                            format: '{player} plays {source} to search their discard pile and hand, but does not find a gadget'
                        },
                        handler: card => {
                            this.lastingEffect(ability => ({
                                until: {
                                    onTechnologicalExhibitionFinished: () => true
                                },
                                match: card,
                                targetLocation: card.location,
                                effect: [
                                    ability.effects.canBeInventedWithoutBooting()
                                ]
                            }));                            
                            this.game.resolveStandardAbility(StandardActions.putIntoPlayWithReduction(5), context.player, card);
                            this.game.queueSimpleStep(() => {
                                this.game.raiseEvent('onTechnologicalExhibitionFinished');
                                if(job.mark === this.game.townsquare.locationCard) {
                                    card.modifyControl(1);
                                }
                            });
                        }
                    }),
                    context
                );                 
            },
            source: this
        });
    }
}

TechnologicalExhibition.code = '14035';

module.exports = TechnologicalExhibition;
