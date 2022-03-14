const DudeCard = require('../../dudecard');

class ForsterCooke extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            targetController: 'current',
            condition: () => this.locationCard.hasOneOfKeywords(['Saloon', 'Casino']),
            match: card => card.getType() === 'dude' && !this.equals(card),
            effect: [
                ability.effects.modifyBullets(1),
                ability.effects.modifyValue(1)
            ]
        });
    }
}

ForsterCooke.code = '12002';

module.exports = ForsterCooke;
