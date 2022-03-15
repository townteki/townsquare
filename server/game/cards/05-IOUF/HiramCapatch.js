const PhaseNames = require('../../Constants/PhaseNames.js');
const DudeCard = require('../../dudecard.js');

class HiramCapatch extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.game.currentPhase === PhaseNames.Upkeep,
            match: card => !card.equals(this) &&
                card.location === 'play area' &&
                card.controller.equals(this.controller) &&
                card.getType() === 'dude' &&
                card.isNearby(this.gamelocation),
            effect: ability.effects.modifyInfluence(1)
        });
    }
}

HiramCapatch.code = '09011';

module.exports = HiramCapatch;
