const DudeCard = require('../../dudecard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class AnthonyShepherd extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.persistentEffect({
            targetController: 'current',
            // Add always-on condition if effect is state dependent so it will be 
            // rechecked after every event
            condition: () => this.controller.ghostrock === 0,
            match: this,
            effect: [
                ability.effects.setAsStud()
            ]
        });
    }
}

AnthonyShepherd.code = '25004';

module.exports = AnthonyShepherd;
