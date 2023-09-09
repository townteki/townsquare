const ActionCard = require('../../actioncard.js');
const { TownSquareUUID } = require('../../Constants/index.js');
const GameActions = require('../../GameActions/index.js');
const RemoveFromPosse = require('../../GameActions/RemoveFromPosse.js');

class AnyPortInAStorm extends ActionCard {
    setupCardAbilities() {
        this.reaction({
            title: 'Any Port in a Storm',
            triggerBefore: true,
            when: {
                onDudeSentHome: event => event.options.isAfterJob || event.options.reason === 'fleeing' || event.options.reason === 'callout_reject'
            },
            handler: context => {
                context.replaceHandler(event => {
                    this.game.promptForLocation(context.player, {
                        activePromptTitle: `Select where ${event.card.title} should move instead`,
                        waitingPromptTitle: 'Waiting for opponent to select location',
                        cardCondition: { 
                            location: 'play area', 
                            owner: 'current', 
                            condition: card => card.uuid !== TownSquareUUID && !card.isOutOfTown() 
                        },
                        cardType: 'deed',
                        onSelect: (player, location) => {
                            player.moveDude(event.card, location.uuid, event.options);
                            if(event.options.isAfterJob || event.options.reason === 'fleeing') {
                                event.thenAttachEvent(RemoveFromPosse.createEvent({ card: event.card, context: event.options.context }));
                            }
                            let didUnboot = false;
                            if(player.getSpendableGhostRock() > 0) {
                                context.game.promptForYesNo(player, {
                                    title: `Do you want to pay 1 GR to unboot ${event.card.title} ?`,
                                    onYes: () => {
                                        player.spendGhostRock(1);
                                        this.game.resolveGameAction(GameActions.unbootCard({ card: event.card }), context);
                                        didUnboot = true;
                                    },
                                    source: this
                                });
                            }
                            this.game.queueSimpleStep(() => {
                                const suffix = didUnboot ? ' and pays 1 GR to unboot {2}' : '';
                                this.game.addMessage('{0} uses {1} to move {2} to {3} instead of going home' + suffix, player, this, event.card, location);
                            });
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
