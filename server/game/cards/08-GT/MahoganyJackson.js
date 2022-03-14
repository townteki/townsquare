const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class MahoganyJackson extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities() {
        this.traitReaction({
            when: {
                onDudeJoinedPosse: event => this.equals(event.card)
            },
            message: context => 
                this.game.addMessage('{0} discards 2 cards from top of their deck thanks to {1}', 
                    context.player, this),
            handler: context => {
                this.game.resolveGameAction(GameActions.discardTopCards({ player: context.player, amount: 2}), context);
            }
        });
    }
}

MahoganyJackson.code = '14011';

module.exports = MahoganyJackson;
