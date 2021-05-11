const ActionCard = require('../../actioncard.js');
const GameActions = require('../../GameActions/index.js');

class HiredGuns extends ActionCard {
    setupCardAbilities() {
        this.action({
            title: 'Place a dude from your discard pile into your hand',
            playType: 'noon',
            target: {
                activePromptTitle: 'Select a dude',
                cardCondition: { location: 'discard pile', controller: 'current' },
                cardType: 'dude'
            },
            message: context =>
                this.game.addMessage('{0} uses {1} to place {2} into their hand', context.player, this, context.target),
            handler: context => 
                this.game.resolveGameAction(GameActions.addToHand({ card: context.target }), context)
        });
    }
}

HiredGuns.code = '01106';

module.exports = HiredGuns;
