const GoodsCard = require('../../goodscard.js');

class QuickdrawHandgun extends GoodsCard {
    setupCardAbilities(ability) {
        this.whileAttached({
            effect: ability.effects.modifyBullets(1)
        });
        this.action({
            title: 'Quickdraw Handgun',
            playType: 'cheatin resolution',
            condition: () => !this.controller.isCheatin(),
            cost: ability.costs.bootSelf(),
            handler: context => {
                let opponent = context.player.getOpponent();
                let savedThisInfo = { drawHand: [...context.player.drawHand], handResult: context.player.handResult };
                let savedOppInfo = { drawHand: [...opponent.drawHand], handResult: opponent.handResult };
                context.player.drawHand = savedOppInfo.drawHand;
                context.player.handResult = savedOppInfo.handResult;
                opponent.drawHand = savedThisInfo.drawHand;
                opponent.handResult = savedThisInfo.handResult;
                this.game.addMessage('{0} uses {1} to swap draw hands.', context.player, this, this.parent);
                let cheatin = context.player.isCheatin() ? 'Cheatin\' ' : '';
                this.game.addMessage('{0}\' hand is: {1}{2} (Rank {3})', context.player, cheatin, context.player.getHandRank().rankName, context.player.getHandRank().rank);
                cheatin = opponent.isCheatin() ? 'Cheatin\' ' : '';
                this.game.addMessage('{0}\' hand is: {1}{2} (Rank {3})', opponent, cheatin, opponent.getHandRank().rankName, opponent.getHandRank().rank);
            }
        });
    }
  
}

QuickdrawHandgun.code = '01093';

module.exports = QuickdrawHandgun;