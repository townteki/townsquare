const DudeCard = require('../../dudecard.js');

class MaxBaine extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.controller.cardsInPlay.reduce((count, card) => {
                if(card.hasKeyword('ranch')) {
                    return count + 1;
                }
                return count;
            }, 0) >= 2,
            match: this,
            effect: ability.effects.modifyControl(1)
        });
        this.persistentEffect({
            targetController: 'current',
            match: card => card.getType() === 'dude' && card.locationCard.hasKeyword('ranch') && !this.equals(card),
            effect: [
                ability.effects.modifyInfluence(1),
                ability.effects.modifyValue(3)
            ]
        });
    }
}

MaxBaine.code = '01034';

module.exports = MaxBaine;
