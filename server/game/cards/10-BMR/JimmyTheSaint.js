const DudeCard = require('../../dudecard.js');

class JimmyTheSaint extends DudeCard {
    setupCardAbilities(ability) {
        this.traitReaction({
            when: {
                onPhaseStarted: event => event.phase === 'upkeep' &&
                    this.isAtDeed() && 
                    this.controller === this.locationCard.controller
            },
            handler: context => {
                this.untilEndOfPhase(context.ability, ability => ({
                    match: this.locationCard,
                    effect: ability.effects.productionToBeReceivedBy(context.player)
                }), 'upkeep');             
            }
        });

        this.persistentEffect({
            condition: () => this.isAtDeed() && 
                this.controller === this.locationCard.controller &&
                this.locationCard.kasKeyword('Casino'),
            match: card => card === this.locationCard,
            effect: ability.effects.modifyProduction(1)
        });
    }
}

JimmyTheSaint.code = '18019';

module.exports = JimmyTheSaint;
