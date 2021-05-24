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
        if(!this.game.shootout) {
            return 0;
        }
        const oppPosse = this.game.shootout.getPosseByPlayer(this.controller.getOpponent());
        if(!oppPosse) {
            return 0;
        }
        return oppPosse.getDudes(dude => dude.isWanted()).length;
    }
}

WylieJenks.code = '02004';

module.exports = WylieJenks;
