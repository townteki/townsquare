const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class LewEsquilin extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.reaction({
            title: 'React: Lew Esquilin',
            grifter: true,
            cost: ability.costs.bootSelf(),
            handler: context => {
                this.game.resolveGameAction(
                    GameActions.search({
                        title: 'Select a card to put to hand',
                        match: { 
                            condition: card => card.hasKeyword('abomination') || 
                                (card.hasKeyword('mystical') && !card.hasKeyword('unique') && card.getType() === 'goods')
                        },
                        topCards: 6,
                        location: ['draw deck'],
                        numToSelect: 1,
                        doNotShuffleDeck: true,
                        message: {
                            format: '{player} plays {source} and looks at top 6 cards of their deck'
                        },
                        cancelMessage: {
                            format: '{player} plays {source} and looks at top 6 cards of their deck, but does not take any of them'
                        },
                        handler: (card, searchContext) => {
                            context.player.discardFromHand(1, discarded => {
                                context.player.moveCardWithContext(card, 'hand', searchContext);
                                this.game.addMessage('{0} uses {1} and discard {2} from hand to put {3} in their hand', 
                                    context.player, this, discarded, card);
                            }, {}, searchContext);
                        }
                    }),
                    context
                );          
            }
        });
    }
}

LewEsquilin.code = 'code';

module.exports = LewEsquilin;
