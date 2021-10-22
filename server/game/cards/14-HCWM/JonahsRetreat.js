const DeedCard = require('../../deedcard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class JonahsRetreat extends DeedCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.persistentEffect({
            targetController: 'any',
            match: this,
            effect: ability.effects.productionToBeReceivedBy(this.controller)
        });
    }
}

JonahsRetreat.code = '22036';

module.exports = JonahsRetreat;
