const DudeCard = require('../../dudecard.js');

class BaijiuSue extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            targetController: 'any',
            condition: () => this.location === 'play area' && this.locationCard.hasKeyword('Saloon') && this.locationCard.getType() === 'deed',
            match: card => card.uuid === this.gamelocation,
            effect: ability.effects.modifyControl(1)
        });
    }
}

BaijiuSue.code = '21009';

module.exports = BaijiuSue;
