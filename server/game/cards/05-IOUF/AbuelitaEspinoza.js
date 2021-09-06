const DudeCard = require('../../dudecard.js');

class AbuelitaEspinoza extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.isAtDeed() && 
                this.locationCard.owner !== this.controller,
            match: card => card !== this &&
                card.location === 'play area' &&
                card.controller === this.controller,
            effect: ability.effects.modifyUpkeep(-1)
        });
    }
}

AbuelitaEspinoza.code = '09013';

module.exports = AbuelitaEspinoza;
