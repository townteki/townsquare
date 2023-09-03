const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

class ObadiahAngstrom extends DudeCard {
    setupCardAbilities(ability) {
        this.job({
            title: 'ObadiahAngstrom',
            playType: 'noon',
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Select deed for demolition',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'any', 
                    condition: card => card.owner.equals(this.controller.getOpponent()) &&
                        !card.isOutOfTown()
                },
                cardType: ['deed']
            },
            onSuccess: (job, context) => {
                context.player.pull((pulledCard, pulledValue, pulledSuit) => {
                    if(['hearts', 'diams'].includes(pulledSuit.toLowerCase())) {
                        this.game.resolveGameAction(GameActions.discardCard({ card: job.mark }), context).thenExecute(() => {
                            this.game.addMessage('{0} uses {1} and pulls {2} to successfuly demolish {3} because pulled card was Red', 
                                context.player, this, pulledCard, job.mark);                               
                        });
                    } else {
                        this.game.addMessage('{0} uses {1} and pulls {2}, but because pulled card was not Red, demolition of {3} fails', 
                            context.player, this, pulledCard, job.mark);                      
                    }
                });          
            }
        });
    }
}

ObadiahAngstrom.code = '25006';

module.exports = ObadiahAngstrom;
