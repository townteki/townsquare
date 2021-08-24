const DudeCard = require('../../dudecard.js');

class ZebWhateleyDupont extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.controller.outfit.gang_code === 'fearmongers',
            match: this,
            effect: ability.effects.setAsStud()
        });

        this.persistentEffect({
            condition: () => this.controller.outfit.gang_code === 'fearmongers' && this.opposingHighGritDude(),
            match: this,
            effect: [
                ability.effects.setMinBullets(2),
                ability.effects.cannotBeSetToDraw()
            ]
        });
    }

    opposingHighGritDude() {
        if(!this.game.shootout) {
            return false;
        }
        const opposingPosse = this.game.shootout.getPosseByPlayer(this.controller.getOpponent()); 
        if(!opposingPosse) {
            return false;
        }
        return opposingPosse.getDudes(dude => dude.getGrit() >= 11).length;
    }
}

ZebWhateleyDupont.code = '19009';

module.exports = ZebWhateleyDupont;
