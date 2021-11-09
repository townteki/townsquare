const PhaseNames = require('../../Constants/PhaseNames.js');
const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class NewVarneyNosferatu extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities() {
        this.traitReaction({
            when: {
                onPhaseStarted: event => event.phase === PhaseNames.HighNoon &&
                    (this.gamelocation === this.game.townsquare.uuid || 
                    this.locationCard && this.locationCard.hasKeyword('public'))
            },
            handler: context => {
                this.game.resolveGameAction(GameActions.sendHome({ card: this }), context).thenExecute(() => {
                    this.game.addMessage('{0} is forced to send {1} home booted because he is in a Public location', 
                        context.player, this);
                });
            }
        });
    }
}

NewVarneyNosferatu.code = '23028';

module.exports = NewVarneyNosferatu;
