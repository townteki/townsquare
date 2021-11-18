const ActionCard = require('../../actioncard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class BadBeat extends ActionCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities() {
        this.action({
            title: 'Bad Beat',
            playType: ['cheatin resolution'],
            message: context => 
                this.game.addMessage('{0} uses {1} to discard {2}\'s cheatin\' hand and replace it with the top five cards of their deck', 
                    context.player, this, context.player.getOpponent()),
            handler: context => {
                const opponent = context.player.getOpponent();
                opponent.discardDrawHand();
                this.game.queueSimpleStep(() => {                
                    opponent.drawDeckAction(5, card => opponent.moveCardWithContext(card, 'draw hand', context));
                    opponent.drawHandRevealed = true;
                    opponent.drawHandSelected = true;
                    opponent.determineHandResult('\'s hand has been changed to', true);
                    if(opponent.isCheatin()) {
                        const amountToPay = opponent.getSpendableGhostRock() > 2 ? 2 : opponent.getSpendableGhostRock();
                        if(amountToPay) {
                            this.game.transferGhostRock({
                                amount: amountToPay,
                                from: opponent,
                                to: context.player
                            });
                            this.game.addMessage('{0} takes {1} GR from {2} because their new hand dealt by {3} is cheatin\'', 
                                context.player, amountToPay, opponent, this);
                        }
                    }
                });
            }
        });
    }
}

BadBeat.code = '23052';

module.exports = BadBeat;
