const DudeCard = require('../../dudecard.js');

class JWByrne extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.hasAttachmentWithKeywords('weapon'),
            match: this,
            effect: ability.effects.modifyBullets(1)
        });
        this.persistentEffect({
            condition: () => this.hasAttachmentWithKeywords('attire'),
            match: this,
            effect: ability.effects.modifyInfluence(1)
        });                
        this.persistentEffect({
            condition: () => this.hasAttachmentWithKeywords('horse'),
            match: this,
            effect: ability.effects.modifyUpkeep(-1)
        });
    }
}

JWByrne.code = '06009';

module.exports = JWByrne;
