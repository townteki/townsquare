const DudeCard = require('../../dudecard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class YingSsiChiehTang extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.action({
            title: 'Resolution: Ying-Ssi Chieh T\'ang',
            playType: ['resolution'],
            cost: ability.costs.payGhostRock(1, true),
            handler: context => {
                context.player.drawCardsToDrawHand(1, context).thenExecute(() => {
                    this.game.promptForSelect(context.player, {
                        activePromptTitle: 'Select a card to discard',
                        cardCondition: { location: 'draw hand', controller: 'current' },
                        onSelect: (player, card) => {
                            player.discardCard(card, false, {}, context).thenExecute(() => {
                                this.game.addMessage('{0} uses {1} to draw a card to their draw hand and discard {2}', 
                                    context.player, this, card);
                            });
                            return true;
                        },
                        onCancel: player => {
                            if(player.drawHand.length > 5) {
                                return false;
                            }
                            return true;
                        },
                        source: this
                    });
                });
            }
        });
    }
}

YingSsiChiehTang.code = '20005';

module.exports = YingSsiChiehTang;
