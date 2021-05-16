const DudeCard = require('../../dudecard.js');

class ChuanJenQi extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.hasAttachmentWithKeywords('horse'),
            match: this,
            effect: ability.effects.modifyInfluence(1)
        });
        this.persistentEffect({
            condition: () => this.hasAttachmentWithKeywords('gadget'),
            match: this,
            effect: ability.effects.modifyBullets(2)
        });
    }
}

ChuanJenQi.code = '05012';

module.exports = ChuanJenQi;
