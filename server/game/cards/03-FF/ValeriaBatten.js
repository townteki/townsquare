const DudeCard = require('../../dudecard.js');

class ValeriaBatten extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            match: this,
            effect: ability.effects.canPerformSkillUsing('huckster', card => card.hasAllOfKeywords(['gadget', 'mystical']))
        });
    }
}

ValeriaBatten.code = '05006';

module.exports = ValeriaBatten;
