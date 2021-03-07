const DudeCard = require('../../dudecard.js');

class IvorHawley extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.hasAttachment(attachment => attachment.getType() === 'spell' && attachment.isHex()),
            match: this,
            effect: [
                ability.effects.modifyBullets(1),
                ability.effects.modifyInfluence(1),
                ability.effects.modifySkillRating(1, 'huckster')
            ]
        });
    }
}

IvorHawley.code = '01014';

module.exports = IvorHawley;
