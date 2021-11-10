const ActionCard = require('../../actioncard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class PlayForBlood extends ActionCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities() {
        this.action({
            title: 'Resolution: Increase rank if tied',
            playType: ['resolution'],
            ifCondition: context => context.player.getTotalRank() === context.player.getOpponent().getTotalRank(),
            ifFailMessage: context =>
                this.game.addMessage('{0} uses {1}, but it does not have any effect because players\' hand ranks are not tied', 
                    context.player, this),
            message: context => this.game.addMessage('{0} uses {1} to increase their hand rank by 1', context.player, this),
            handler: context => {
                context.player.modifyRank(1);
            }
        });

        this.action({
            title: 'Noon: Draw and discard a card',
            playType: ['noon'],
            handler: context => {
                context.player.drawCardsToHand(1, context);
                context.player.discardFromHand(1, discarded => 
                    this.game.addMessage('{0} uses {1} to draw a card and discard {2}', context.player, this, discarded), 
                {}, context);
            }
        });
    }
}

PlayForBlood.code = '23051';

module.exports = PlayForBlood;
