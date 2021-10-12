const PhaseNames = require('../../Constants/PhaseNames.js');
const DudeCard = require('../../dudecard.js');

class Natalya extends DudeCard {
    setupCardAbilities() {
        this.traitReaction({
            when: {
                onPhaseStarted: event => event.phase === PhaseNames.Upkeep &&
                    this.location === 'play area' && 
                    this.locationCard.getType() === 'deed' && 
                    this.controller.ghostrock < this.controller.getOpponent().ghostrock
            },
            handler: context => {
                this.untilEndOfPhase(context.ability, ability => ({
                    match: this.locationCard,
                    effect: ability.effects.productionToBeReceivedBy(context.player)
                }), PhaseNames.Upkeep);             
            }
        });
    }
}

Natalya.code = '09008';

module.exports = Natalya;
