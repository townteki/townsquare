const ActionCard = require('../../actioncard.js');
const GameActions = require('../../GameActions/index.js');

class Missed extends ActionCard {
    setupCardAbilities() {
        this.action({
            title: 'Missed!',
            playType: ['shootout'],
            target: {
                activePromptTitle: 'Select your dude to unboot',
                cardCondition: { location: 'play area', controller: 'current', participating: true },
                cardType: ['dude']
            },
            handler: context => {
                this.game.resolveGameAction(GameActions.unbootCard({ card: context.target }));
                this.game.addMessage('{0} uses {1} to unboot {2}.', context.player, this, context.target);
            }
        });
    }
}

Missed.code = '01139';

module.exports = Missed;
