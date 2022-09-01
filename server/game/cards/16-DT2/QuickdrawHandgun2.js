const GoodsCard = require('../../goodscard');

class QuickdrawHandgun2 extends GoodsCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Quickdraw Handgun',
            playType: 'cheatin resolution',
            condition: () => !this.controller.isCheatin(),
            cost: ability.costs.bootSelf(),
            message: context =>
                this.game.addMessage('{0} uses {1} to swap draw hands', context.player, this, this.parent),
            handler: context => {
                let opponent = context.player.getOpponent();
                let savedThisInfo = { drawHand: [...context.player.drawHand], handResult: context.player.handResult };
                let savedOppInfo = { drawHand: [...opponent.drawHand], handResult: opponent.handResult };
                context.player.drawHand = savedOppInfo.drawHand;
                context.player.handResult = savedOppInfo.handResult;
                opponent.drawHand = savedThisInfo.drawHand;
                opponent.handResult = savedThisInfo.handResult;
                context.player.determineHandResult('changes hand to');
                opponent.determineHandResult('changes hand to');
                context.player.getHandRank().cheatin = false;
                this.game.addMessage('{0}\'s current rank: {1} (modifier {2})', 
                    context.player, context.player.getTotalRank(), context.player.rankModifier);
                this.game.addMessage('{0}\'s current rank: {1} (modifier {2})', 
                    opponent, opponent.getTotalRank(), opponent.rankModifier);
            }
        });
    }    
}

QuickdrawHandgun2.code = '24165';

module.exports = QuickdrawHandgun2;
