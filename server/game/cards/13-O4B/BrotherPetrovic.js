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

                if(opponent.ghostrock >= 2) {
                    context.player.modifyGhostRock(2);
                    opponent.modifyGhostRock(-2);
                    this.game.addMessage('{0} uses {1} to force {2} to pay them 2 GR', context.player, this, opponent);
                } else {
                    this.game.addMessage('{0} tries to use {1} to force {2} to pay them 2 GR but {2} is too poor', context.player, this, opponent);
                }
            }
        });
    }
}

BrotherPetrovic.code = '21013';

module.exports = BrotherPetrovic;
