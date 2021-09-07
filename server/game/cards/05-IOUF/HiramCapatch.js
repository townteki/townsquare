const DudeCard = require('../../dudecard.js');

class HiramCapatch extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.game.currentPhase === 'upkeep',
            match: card => card !== this &&
                card.location === 'play area' &&
                card.controller === this.controller &&
                card.getType() === 'dude' &&
                card.isNearby(this.gamelocation),
            effect: ability.effects.modifyInfluence(1)
        });
    }
}

HiramCapatch.code = '09011';

module.exports = HiramCapatch;
