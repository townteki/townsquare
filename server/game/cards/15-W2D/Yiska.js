const DudeCard = require('../../dudecard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class Yiska extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.hasAttachmentWithKeywords(['sidekick']),
            match: this,
            effect: ability.effects.modifyBullets(2)
        });
    }
}

Yiska.code = '23016';

module.exports = Yiska;
