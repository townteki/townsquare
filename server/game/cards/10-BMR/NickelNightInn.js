const DeedCard = require('../../deedcard.js');
const GameActions = require('../../GameActions/index.js');

class NickelNightInn extends DeedCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Boot a Dude',
            playType: 'noon',
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose a dude to boot',
                waitingPromptTitle: 'Waiting for opponent to choose a dude',
                location: 'play area',
                cardCondition: {condition: card => (card.gamelocation === this.gamelocation || card.isAdjacent(this.gamelocation)) && card.value <= 3},
                cardType: 'dude',
                gameAction: 'bootDude'
            },
            message: context => {
                this.game.addMessage('{0} uses {1} to boot {2}', context.player, this, context.target)
            },
            handler: context => {
                this.game.resolveGameAction(GameActions.bootCard({ card: context.target }), context);
            }
        });
    }
}

NickelNightInn.code = '18022';

module.exports = NickelNightInn;
