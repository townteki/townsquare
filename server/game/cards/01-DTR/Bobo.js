const DudeCard = require('../../dudecard.js');

class Bobo extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => !!this.getHighestHucksterSkillRating(),
            match: this,
            effect: ability.effects.dynamicBullets(() => this.getHighestHucksterSkillRating())
        });
    }

    getHighestHucksterSkillRating() {
        return this.game.getDudesInPlay().reduce((highestHucksterSkillRating, dude) => {
            const skillRating = dude.getSkillRating('huckster') || 0;
            return Math.max(highestHucksterSkillRating, skillRating);
        }, 0);
    }
}

Bobo.code = '01007';

module.exports = Bobo;
