const DudeCard = require('../../dudecard.js');

class WylieJenks extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.isParticipating(),
            match: this,
            effect: [
                ability.effects.dynamicBullets(() => this.getWantedDudesInOpposingPosse())
            ]
        });
    }

    getWantedDudesInOpposingPosse() {
        if(!this.game.shootout || !this.game.shootout.opposingPosse) {
            return 0;
        }
        let opposingWantedDudes = this.game.shootout.opposingPosse.getDudes(dude => dude.isWanted());
        return opposingWantedDudes.length;
    }
}

WylieJenks.code = '02004';

module.exports = WylieJenks;
