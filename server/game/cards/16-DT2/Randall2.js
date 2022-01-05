const DudeCard = require('../../dudecard.js');

class Randall2 extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.numberOfLocations() >= 3,
            match: player => player === this.controller,
            effect: ability.effects.modifyHandSize(1)
        });
    }

    numberOfLocations() {
        let locations = [];
        return this.controller.cardsInPlay.reduce((memo, card) => {
            if(card.getType() === 'dude' && !card.locationCard.isOutOfTown() && !locations.includes(card.gamelocation)) {
                locations.push(card.gamelocation);
                return memo + 1;
            }
            return memo;
        }, 0);
    }
}

Randall2.code = '24014';

module.exports = Randall2;
