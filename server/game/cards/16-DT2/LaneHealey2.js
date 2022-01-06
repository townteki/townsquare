const DudeCard = require('../../dudecard');

class LaneHealey2 extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.hasAttachment(attachment => attachment.hasKeyword('Horse')),
            match: this,
            effect: [
                ability.effects.modifyBullets(2),
                ability.effects.modifyUpkeep(-1)
            ]
        });
    }
}

LaneHealey2.code = '24033';

module.exports = LaneHealey2;
