const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class TheBrute extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities() {
        this.traitReaction({
            when: {
                onCardAced: event => event.card === this && event.isCasualty
            },
            location: 'dead pile',
            handler: context => {
                this.game.resolveGameAction(GameActions.decreaseCasualties({ 
                    player: context.player, 
                    amount: 2 
                }), context).thenExecute(() => {
                    this.game.addMessage('{0} reduces their casualties by 2 thanks to {1}', context.player, this);
                }); 
            }
        });
    }
}

TheBrute.code = '04001';

module.exports = TheBrute;
