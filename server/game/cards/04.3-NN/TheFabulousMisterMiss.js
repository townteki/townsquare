const DudeCard = require('../../dudecard.js');
const PhaseNames = require('../../Constants/PhaseNames.js');

class TheFabulousMisterMiss extends DudeCard {
    setupCardAbilities() {
        this.traitReaction({
            when: {
                onDudeRejectedCallOut: event => event.caller === this
            },
            message: context => this.game.addMessage('{0} gets -3 influence for not standing up to {1}',
                context.event.callee, this),
            handler: context => {
                this.untilEndOfPhase(context.ability, ability => ({
                    match: context.event.callee,
                    effect: ability.effects.modifyInfluence(-3)
                }), PhaseNames.Sundown);
            }
        });
    }
}

TheFabulousMisterMiss.code = '08002';

module.exports = TheFabulousMisterMiss;
