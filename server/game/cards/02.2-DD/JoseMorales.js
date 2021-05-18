const DudeCard = require('../../dudecard.js');

class JoseMorales extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.game.shootout && this.isParticipating(),
            match: this,
            effect: ability.effects.modifySkillRating('huckster', this.bullets)
        });
    }
}

JoseMorales.code = '03008';

module.exports = JoseMorales;
