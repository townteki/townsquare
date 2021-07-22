const DudeCard = require('../../dudecard.js');

class BrotherPetrovic extends DudeCard {
    setupCardAbilities() {
        this.reaction({
            triggerBefore: true,
            when: {
                onCardAced: event => event.card === this && event.originalLocation === 'play area' && event.isCasualty,
                onCardDiscarded: event => event.card === this && event.originalLocation === 'play area' && event.isCasualty
            },
            handler: context => {
                let opponent = context.player.getOpponent();
                if(opponent.ghostrock >= this.influence) {
                    this.game.transferGhostRock({from: opponent, to: context.player, amount: this.influence});
                    this.game.addMessage('{0} uses {1} to force {2} to pay them {3} GR', context.player, this, opponent, this.influence);
                } else {
                    this.game.addMessage('{0} tries to use {1} to force {2} to pay them {3} GR but {2} is too poor', context.player, this, opponent, this.influence);
                }
            }
        });
    }
}

BrotherPetrovic.code = '21013';

module.exports = BrotherPetrovic;
