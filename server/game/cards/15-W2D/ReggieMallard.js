const DudeCard = require('../../dudecard.js');

class ReggieMallard extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            match: this,
            condition: () => this.game.shootout && this.isParticipating(),
            effect: ability.effects.dynamicBullets(() => this.getHucksterDudesInPosse())
        });
    }

    getHucksterDudesInPosse() {
        if(!this.game.shootout) {
            return 0;
        }
        const posse = this.game.shootout.getPosseByPlayer(this.controller);

        if(Posse) {
            // Check if there are more than 4 hucksters in the posse, and if so, return 4, otherwise return the number of hucksters in the posse
            const hucksters = Posse.getDudes(dude => dude.hasKeyword('huckster'));
            return (hucksters.length > 4) ? 4 : hucksters.length;
        }
        return 0;
    }
}

ReggieMallard.code = '23024';

module.exports = ReggieMallard;
