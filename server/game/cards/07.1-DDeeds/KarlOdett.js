const DudeCard = require('../../dudecard.js');

class KarlOdett extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.controller.cardsInPlay.every(card => card.getType() !== 'dude' || card.hasKeyword('abomination')),
            match: this,
            effect: ability.effects.modifyInfluence(3)
        });
    }
}

KarlOdett.code = '11008';

module.exports = KarlOdett;
