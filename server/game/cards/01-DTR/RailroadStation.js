const DeedCard = require('../../deedcard.js');
const GameActions = require('../../GameActions/index.js');

class RailroadStation extends DeedCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Railroad Station',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            target:{
                activePromptTitle: 'Select dude to move from this location',
                cardCondition: { location: 'play area', controller: 'current', condition: card => card.locationCard === this },
                cardType: ['dude'],
                gameAction: 'moveDude'
            },
            handler: context => {
                this.game.promptForLocation(context.player, {
                    activePromptTitle: 'Select destination for ' + context.target.title,
                    waitingPromptTitle: 'Waiting for opponent to select location',
                    cardCondition: {
                        location: 'play area',
                        condition: card => !card.equals(this)
                    },
                    onSelect: (player, location) => {
                        this.game.resolveGameAction(GameActions.moveDude({ 
                            card: context.target, 
                            targetUuid: location.uuid
                        }), context);   
                        this.game.addMessage('{0} uses {1} to move {2} to {3}', player, this, context.target, location);                                 
                        return true;
                    },
                    source: this
                });
            }

        });
    }
}

RailroadStation.code = '01079';

module.exports = RailroadStation;
