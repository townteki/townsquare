const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

class AsakichiCooke extends DudeCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Move Your Dude',
            cost: ability.costs.discardFromHand(),
            target: {
                activePromptTitle: 'Choose one of your other dudes at this location to move',
                waitingPromptTitle: 'Waiting for opponent to choose a dude',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'current', 
                    condition: card => card.locationCard === this.locationCard && card !== this,
                    cardType: 'dude'
                }
            },
            actionContext: { card: this, gameAction: 'moveDude' },
            handler: context => {
                this.game.promptForLocation(context.player, {
                    activePromptTitle: 'Select where to move your dude',
                    waitingPromptTitle: 'Waiting for opponent to select location',
                    onSelect: (player, location) => {
                        this.game.resolveGameAction(GameActions.moveDude({ 
                            card: context.target, 
                            targetUuid: location.uuid
                        }), context);   
                        this.game.addMessage('{0} uses {1} to discard a card from hand and move {2} to {3}', player, this, context.target, location);                                 
                        return true;
                    }
                });
            }
        });
    }
}

AsakichiCooke.code = '10004';

module.exports = AsakichiCooke;
