const ActionCard = require('../../actioncard.js');
const RemoveFromPosse = require('../../GameActions/RemoveFromPosse.js');

class AnyPortInAStorm extends ActionCard {
    setupCardAbilities() {
        this.reaction({
            title: 'Any Port in a Storm',
            triggerBefore: true,
            when: {
                onDudeMoved: event => event.options.isAfterJob || event.options.reason === 'fleeing' || event.options.reason === 'callout_reject'
            },
            handler: context => {
                context.replaceHandler(event => {
                    this.game.promptForLocation(context.player, {
                        activePromptTitle: `Select where ${event.card} should move instead`,
                        waitingPromptTitle: 'Waiting for opponent to select location',
                        cardCondition: { 
                            location: 'play area', 
                            owner: 'current', 
                            condition: card => !card.isOutOfTown() 
                        },
                        cardType: 'deed',
                        onSelect: (player, location) => {
                            player.moveDude(event.card, location.uuid, event.options);
                            if(event.options.isAfterJob || event.options.reason === 'fleeing') {
                                event.thenAttachEvent(RemoveFromPosse.createEvent({ card: event.card, context: event.options.context }));
                            }
                            this.game.addMessage('{0} uses {1} to move {2} to {3} instead of running home', player, this, event.card, location);                         
                            return true;
                        }
                    });
                });              
            }
        });
    }
}

AnyPortInAStorm.code = '25056';

module.exports = AnyPortInAStorm;
