const DeedCard = require('../../deedcard.js');
const GameActions = require('../../GameActions/index.js');

class TheWhateleyEstate2 extends DeedCard {
    setupCardAbilities(ability) {
        this.reaction({
            when: {
                onDudeEnteredLocation: event => event.gameLocation.locationCard === this &&
                    event.card.controller !== this.owner
            },
            triggeringPlayer: 'owner',
            handler: context => {
                this.game.resolveGameAction(GameActions.bootCard({ card: context.event.card }), context);
            }
        });
        this.action({
            title: 'The Whateley Estate',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose a card',
                cardCondition: { location: 'dead pile', controller: 'current' },
                cardType: ['deed', 'goods', 'spell', 'action', 'joker']
            },
            message: context =>
                this.game.addMessage('{0} uses {1} to move {2} from Boot Hill to discard pile', context.player, this, context.target),
            handler: context => {
                context.player.moveCard(context.target, 'discard pile');
            }
        });
    }
}

TheWhateleyEstate2.code = '25187';

module.exports = TheWhateleyEstate2;
