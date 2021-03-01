const DeedCard = require('../../deedcard.js');
const GameActions = require('../../GameActions/index.js');

class CartersBounties extends DeedCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Carter\'s Bounties',
            playType: 'shootout:join',
            cost: ability.costs.bootSelf(),
            condition: () => this.game.shootout,
            target: {
                activePromptTitle: 'Select dude to join posse',
                cardCondition: { location: 'play area', condition: card => !card.isParticipating() },
                cardType: ['dude']
            },
            handler: context => {
                this.game.resolveGameAction(GameActions.joinPosse({ card: context.target }), context);
                this.game.addMessage('{0} uses {1} to move {2} to posse.', context.player, this, context.target);
            }
        });
    }
}

CartersBounties.code = '01073';

module.exports = CartersBounties;
