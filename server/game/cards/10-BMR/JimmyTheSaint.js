const PhaseNames = require('../../Constants/PhaseNames.js');
const DudeCard = require('../../dudecard.js');

class JimmyTheSaint extends DudeCard {
    setupCardAbilities(ability) {
        this.traitReaction({
            when: {
                onPhaseStarted: event => event.phase === PhaseNames.Upkeep &&
                    this.isAtDeed() && 
                    this.controller.equals(this.locationCard.controller)
            },
            handler: context => {
                this.untilEndOfPhase(context.ability, ability => ({
                    match: this.locationCard,
                    effect: ability.effects.productionToBeReceivedBy(context.player)
                }), PhaseNames.Upkeep);             
            }
        });

        this.persistentEffect({
            condition: () => this.isAtDeed() && 
                this.controller.equals(this.locationCard.controller) &&
                this.locationCard.hasKeyword('Casino'),
            match: card => card.equals(this.locationCard),
            effect: ability.effects.modifyProduction(1)
        });
    }
}

JimmyTheSaint.code = '18019';

module.exports = JimmyTheSaint;
