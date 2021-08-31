const DudeCard = require('../../dudecard');

class MirandaClarke extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.control > 0,
            match: this,
            effect: ability.effects.modifyInfluence(2)
        });

        this.persistentEffect({
            condition: () => this.bounty >= 2,
            match: this,
            effect: ability.effects.modifyBullets(2)
        });
    }
}

MirandaClarke.code = '12008';

module.exports = MirandaClarke;
