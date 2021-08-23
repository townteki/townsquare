const DudeCard = require('../../dudecard.js');

class Randall extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.location === 'play area' &&
                this.game.currentPhase !== 'setup' &&
                this.game.getDudesAtLocation(this.gamelocation).length > 2,
            match: player => player === this.controller,
            effect: ability.effects.modifyHandSize(1)
        });
    }
}

Randall.code = '09005';

module.exports = Randall;
