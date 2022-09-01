const ActionCard = require('../../actioncard.js');
const GameActions = require('../../GameActions/index.js');

class BackWays extends ActionCard {
    setupCardAbilities() {
        this.action({
            title: 'Back Ways',
            playType: ['noon'],
            target: {
                activePromptTitle: 'Select your wanted dude to move',
                cardCondition: {
                    location: 'play area',
                    controller: 'current',
                    wanted: true
                },
                cardType: ['dude'],
                gameAction: 'moveDude'
            },
            handler: context => {
                const erstwhileLocation = context.target.locationCard;
                this.game.promptForLocation(context.player, {
                    activePromptTitle: 'Choose destination for ' + context.target.title,
                    cardCondition: {
                        location: 'play area',
                        condition: card => !card.equals(erstwhileLocation)
                    },
                    onSelect: (player, location) => {
                        this.game.resolveGameAction(GameActions.moveDude({ 
                            card: context.target, 
                            targetUuid: location.uuid
                        }), context);
                        this.game.addMessage('{0} uses {1} to move {2} from {3} to {4}',
                            player, this, context.target, erstwhileLocation, location);
                        return true;
                    },
                    source: this
                });
            }
        });
    }
}

BackWays.code = '02019';

module.exports = BackWays;
