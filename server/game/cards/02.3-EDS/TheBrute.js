const DudeCard = require('../../dudecard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class TheBrute extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities() {
        this.traitReaction({
            when: {
                onCardAced: event => event.card === this && event.isCasualty
            },
            location: 'dead pile',
            message: context =>
                this.game.addMessage('{0} reduces their casualties by 2 thanks to {1}', context.player, this),
            handler: context => {
                context.player.modifyCasualties(-2);
            }
        });
    }
}

TheBrute.code = '04001';

module.exports = TheBrute;
