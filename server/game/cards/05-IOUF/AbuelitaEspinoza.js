const DudeCard = require('../../dudecard.js');

class AbuelitaEspinoza extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.isAtDeed() && 
                this.locationCard.owner !== this.controller,
            match: card => !card.equals(this) &&
                card.location === 'play area' &&
                card.controller.equals(this.controller) &&
                card.getType() === 'dude',
            effect: ability.effects.modifyUpkeep(-1)
        });
    }
}

AbuelitaEspinoza.code = '09013';

module.exports = AbuelitaEspinoza;
