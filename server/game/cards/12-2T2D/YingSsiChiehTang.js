const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class YingSsiChiehTang extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.action({
            title: 'Resolution: Ying-Ssi Chieh T\'ang',
            playType: ['resolution'],
            cost: ability.costs.payGhostRock(1, true),
            handler: context => {
                context.player.drawCardsToDrawHand(1, context).thenExecute(event => {
                    this.game.promptForSelect(context.player, {
                        activePromptTitle: 'Select a card to discard',
                        cardCondition: { location: 'draw hand', controller: 'current' },
                        onSelect: (player, card) => {
                            this.game.resolveGameAction(GameActions.discardCard({ card }), context).thenExecute(() => {
                                this.game.addMessage('{0} uses {1} to draw {2} to their draw hand and discard {2}', 
                                    player, this, event.cards, card);
                                if(!event.cards.includes(card)) {
                                    player.determineHandResult('\'s hand has been changed to');
                                }
                            });
                            return true;
                        },
                        onCancel: player => {
                            if(player.drawHand.length > 5) {
                                return false;
                            }
                            return true;
                        },
                        context,
                        source: this
                    });
                });
            }
        });
    }
}

YingSsiChiehTang.code = '20005';

module.exports = YingSsiChiehTang;
