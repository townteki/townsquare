const DeedCard = require('../../deedcard.js');
const GameActions = require('../../GameActions/index.js');

class StephGertiesTonsorium extends DeedCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Noon: Steph & Gertie\'s Tonsorium',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            condition: () => this.controller.hand.length,
            target: {
                activePromptTitle: 'Select card',
                cardCondition: { location: 'hand', controller: 'current' }
            },
            handler: context => {
                context.player.shuffleCardIntoDeck(context.target);
                const cardToDiscard = context.player.drawDeck[0];
                this.game.resolveGameAction(GameActions.discardCard({ 
                    card: cardToDiscard
                }), context).thenExecute(() => {
                    this.game.addMessage('{0} uses {1} to shuffle card to deck and discard {2} from top of the deck', 
                        context.player, this, cardToDiscard);
                });
            }
        });
    }
}

StephGertiesTonsorium.code = '21038';

module.exports = StephGertiesTonsorium;
