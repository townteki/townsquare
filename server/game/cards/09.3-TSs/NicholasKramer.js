const DudeCard = require('../../dudecard.js');

class NicholasKramer extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => true,
            match: this,
            effect: ability.effects.dynamicBullets(() => this.getKramerBulletBonus())
        });
    }

    getKramerBulletBonus() {
        const numOfGadgets = this.controller.cardsInPlay.filter(card => card.isGadget()).length;
        return numOfGadgets > 4 ? 4 : numOfGadgets;
    }
}

NicholasKramer.code = '17007';

module.exports = NicholasKramer;
