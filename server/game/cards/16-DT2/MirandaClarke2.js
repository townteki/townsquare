const DudeCard = require('../../dudecard');

class MirandaClarke2 extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.control > 0,
            match: this,
            effect: ability.effects.modifyInfluence(1)
        });

        this.persistentEffect({
            condition: () => this.bounty >= 2,
            match: this,
            effect: ability.effects.modifyBullets(2)
        });
    }
}

MirandaClarke2.code = '24082';

module.exports = MirandaClarke2;
