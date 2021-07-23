const DudeCard = require('../../dudecard.js');

class BlackElkExp1 extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.locationCard.getType() === 'deed',
            match: this,
            effect: ability.effects.determineControlBySkill('shaman')
        });
    }
}

BlackElkExp1.code = '21017';

module.exports = BlackElkExp1;
