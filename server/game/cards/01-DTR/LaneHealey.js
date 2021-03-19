const DudeCard = require('../../dudecard.js');

class LaneHealey extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.hasAttachment(attachment => attachment.hasKeyword('Horse')),
            match: this,
            effect: [
                ability.effects.modifyBullets(2)
            ]
        });
    }
}

LaneHealey.code = '01030';

module.exports = LaneHealey;
