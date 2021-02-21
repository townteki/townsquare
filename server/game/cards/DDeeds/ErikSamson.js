const DudeCard = require('../../dudecard.js');

class ErikSamson extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.hasAttachment(attachment => attachment.hasKeyword('Mystical')),
            match: this,
            effect: [
                ability.effects.modifyInfluence(1)
            ]
        });
        this.persistentEffect({
            condition: () => this.hasAttachment(attachment => attachment.hasAllOfKeywords(['Melee', 'Weapon'])),
            match: this,
            effect: [
                ability.effects.setAsStud()
            ]
        });
    }
}

ErikSamson.code = '11009';

module.exports = ErikSamson;
