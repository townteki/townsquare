const ActionCard = require('../../actioncard.js');

class BottomDealin extends ActionCard {
    setupCardAbilities() {
        this.action({
            title: 'Bottom Dealin\'',
            playType: ['cheatin resolution'],
            message: context => 
                this.game.addMessage('{0} uses {1} to discard {2}\'s cheatin\' hand and replace it with the top five cards of their deck', 
                    context.player, this, context.player.getOpponent()),
            handler: context => {
                const opponent = context.player.getOpponent();
                opponent.discardDrawHand();
                this.game.queueSimpleStep(() => {
                    const top5Cards = context.player.drawDeck.slice(0, 5);
                    top5Cards.forEach(card => opponent.moveCard(card, 'draw hand'));
                    opponent.drawHandRevealed = true;
                    opponent.drawHandSelected = true;
                    opponent.determineHandResult('\'s hand has been bottom dealt to', true);
                });
            }
        });
    }
}

BottomDealin.code = '01108';

module.exports = BottomDealin;
