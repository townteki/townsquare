const DeedCard = require('../../deedcard.js');
const GameActions = require('../../GameActions/index.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class GageExportCo extends DeedCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.action({
            title: 'Noon: Gage Export Co.',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Select a card',
                choosingPlayer: 'current',
                cardCondition: { location: 'discard pile', controller: 'current' }
            },
            handler: context => {
                this.game.resolveGameAction(GameActions.shuffleIntoDeck({ cards: context.target }), context).thenExecute(() => {
                    context.player.discardFromDrawDeck(1, discarded => 
                        this.game.addMessage('{0} uses {1} to shuffle {2} into draw deck and discard {3} from top of the draw deck', 
                            context.player, this, context.target, discarded));
                });
            }
        });
    }
}

GageExportCo.code = '21043';

module.exports = GageExportCo;
