const DudeCard = require('../../dudecard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class BuzzCrover extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => true,
            match: this,
            effect: [
                ability.effects.dynamicBullets(() => this.getBuzzBonus())
            ]
        });
    }

    getBuzzBonus() {
        let locations = [];
        const numOfLocations = this.controller.cardsInPlay.reduce((memo, card) => {
            if(card.getType() === 'dude' && !card.equals(this) && card.isNearby(this.gamelocation) && !locations.includes(card.gamelocation)) {
                locations.push(card.gamelocation);
                return memo + 1;
            }
            return memo;
        }, 0);
        return numOfLocations > 4 ? 4 : numOfLocations;
    }    
}

BuzzCrover.code = '25001';

module.exports = BuzzCrover;
