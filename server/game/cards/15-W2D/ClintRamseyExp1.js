const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class ClintRamseyExp1 extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities() {
        this.reaction({
            title: 'React: Clint Ramsey (Exp.1)',
            when: {
                onDrawHandsRevealed: () => this.controller.getOpponent().isCheatin()
            },
            repeatable: true,
            message: context => 
                this.game.addMessage('{0} uses {1} to unboot himself', context.player, this),
            handler: context => {
                this.game.resolveGameAction(GameActions.unbootCard({ card: this }), context);
            }
        });
    }
}

ClintRamseyExp1.code = '23019';

module.exports = ClintRamseyExp1;
