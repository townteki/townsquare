const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class ArielleMoriah extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities() {
        this.reaction({
            title: 'React: Arielle Moriah',
            when: {
                onCardBooted: event => event.card === this &&
                    event.context.source && event.context.source.hasKeyword('miracle')
            },
            message: context => 
                this.game.addMessage('{0} uses {1} to unboot her', context.player, this),
            handler: context => {
                this.game.resolveGameAction(GameActions.unbootCard({ card: this }), context);
            }
        });
    }
}

ArielleMoriah.code = '22006';

module.exports = ArielleMoriah;
