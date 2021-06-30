const DudeCard = require('../../dudecard.js');

class MatthewRisingSun extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            match: this,
            effect: ability.effects.canPerformSkillUsing('kung fu', card => card.hasAllOfKeywords(['spirit', 'totem']))
        });
    }
}

MatthewRisingSun.code = '20011';

module.exports = MatthewRisingSun;
