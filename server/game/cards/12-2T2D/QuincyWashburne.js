const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class QuincyWashburne extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities() {
        this.reaction({
            title: 'React: Quincy Washburne',
            when: {
                onGadgetInvented: event => event.scientist === this && this.booted &&
                    event.gadget.hasKeyword('weapon')
            },
            message: context => this.game.addMessage('{0} uses {1} to unboot him', context.player, this),
            handler: context => {
                this.game.resolveGameAction(GameActions.unbootCard({ card: this }), context);
            }
        });
    }
}

QuincyWashburne.code = '20020';

module.exports = QuincyWashburne;
