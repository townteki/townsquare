const GameActions = require('../../GameActions/index.js');
const OutfitCard = require('../../outfitcard.js');

class The108RighteousBandits extends OutfitCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Noon: The 108 Righteous Bandits',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose your dude',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'current'
                },
                cardType: ['dude'],
                gameAction: 'moveDude'
            },
            handler: context => {
                this.game.promptForSelect(context.player, {
                    activePromptTitle: 'Select a location to move to',
                    waitingPromptTitle: 'Waiting for opponent to select location',
                    cardCondition: card => card.location === 'play area' &&
                        card.uuid !== context.target.gamelocation &&
                        this.game.getDudesAtLocation(card.uuid).some(dude => dude.controller === this.owner),
                    cardType: 'location',
                    onSelect: (player, location) => {
                        this.game.resolveGameAction(GameActions.moveDude({ card: context.target, targetUuid: location.uuid }), context).thenExecute(() => {
                            this.game.addMessage('{0} uses {1} to move {2} to {3}', player, this, context.target, location);                        
                        });
                        return true;
                    }
                });
            }
        });
    }
}

The108RighteousBandits.code = '09001';

module.exports = The108RighteousBandits;
