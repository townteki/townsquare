const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');
const HandResult = require('../../handresult.js');

class HenryMoran extends DudeCard {
    setupCardAbilities() {
        this.traitReaction({
            triggerBefore: true,
            when: {
                onDrawHandsRevealed: () => !this.booted && this.game.currentPhase === 'gambling' &&
                    this.checkIfIllegal()
            },
            message: context => 
                this.game.addMessage('{0} boots {1}, discards the illegal hand and reveals a new one', 
                    context.player, this),
            handler: context => {
                this.game.resolveGameAction(GameActions.bootCard({ card: this }), context);
                context.player.discardDrawHand();
                this.game.queueSimpleStep(() => {
                    const actualAmount = context.player.getNumCardsToDraw(5);
                    const props = {
                        amount: actualAmount,
                        desiredAmount: 5
                    };                    
                    context.player.drawDeckAction(props, card => context.player.moveCard(card, 'draw hand'));
                });
            }
        });
    }

    checkIfIllegal() {
        if(!this.controller.drawHand || this.controller.drawHand.length <= 0) {
            return false;
        }
        const handResult = new HandResult(this.controller.drawHand, true);
        return handResult && handResult.getHandRank().cheatin;
    }
}

HenryMoran.code = '14013';

module.exports = HenryMoran;
