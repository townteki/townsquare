const DudeCard = require('../../dudecard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class ChristinePerfectExp1 extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.persistentEffect({
            targetController: 'current',
            // Add always-on condition if effect is state dependent so it will be 
            // rechecked after every event
            condition: () => this.game.shootout && this.game.shootout.isJob() &&
                this.isParticipating() &&
                this.game.shootout.belongsToLeaderPlayer(this),
            match: this,
            effect: [
                ability.effects.setAsStud()
            ]
        });
    }
}

ChristinePerfectExp1.code = '25024';

module.exports = ChristinePerfectExp1;
