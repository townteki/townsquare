const DudeCard = require('../../dudecard.js');

class MariaKingsford extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.game.shootout,
            match: this,
            effect: ability.effects.addSkillKfBonus(skillName => {
                if(skillName === 'huckster') {
                    return this.bounty || 0;
                }
            }, this)
        });
    }
}

MariaKingsford.code = '05015';

module.exports = MariaKingsford;
