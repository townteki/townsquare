const DeedCard = require('../../deedcard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class TheVeiledCrossing extends DeedCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.persistentEffect({
            targetController: 'any',
            condition: () => true,
            match: this,
            effect: [
                ability.effects.additionalDynamicAdjacency(card => 
                    !card.equals(this) &&
                    card.location === 'play area' && 
                    card.isLocationCard() && 
                    card.hasKeyword('holy ground'), 
                this.uuid)
            ]
        });
    }
}

TheVeiledCrossing.code = '25035';

module.exports = TheVeiledCrossing;
