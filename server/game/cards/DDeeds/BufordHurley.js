const DudeCard = require('../../dudecard.js');

class BufordHurley extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            targetController: 'any',
            condition: () => this.location === 'play area' && this.locationCard.hasOneOfKeywords(['Saloon', 'Casino']),
            match: card => card.uuid === this.gamelocation,
            effect: ability.effects.modifyProduction(-1)
        });
        this.persistentEffect({
            condition: () => this.location === 'play area' && this.locationCard.hasOneOfKeywords(['Saloon', 'Casino']),
            match: this,
            effect: ability.effects.modifyUpkeep(-1)
        });
    }
}

BufordHurley.code = '11011';

module.exports = BufordHurley;
