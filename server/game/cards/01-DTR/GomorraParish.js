const DeedCard = require('../../deedcard.js');
const GameActions = require('../../GameActions/index.js');

class GomorraParish extends DeedCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Gomorra Parish',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Select a card to ace',
                cardCondition: { location: 'hand', controller: 'current' },
                gameAction: 'ace'
            },
            message: context => 
                this.game.addMessage('{0} uses {1} and aces {2} from hand to gain 1 GR', context.player, this, context.target),
            handler: context => {
                this.game.resolveGameAction(GameActions.aceCard({ card: context.target }), context).thenExecute(() => {
                    context.player.modifyGhostRock(1);
                });
            }
        });
    }
}

GomorraParish.code = '01057';

module.exports = GomorraParish;
