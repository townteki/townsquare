const DudeCard = require('../../dudecard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class SamBass extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.persistentEffect({
            targetController: 'any',
            condition: () => this.isParticipating(),
            effect: [
                ability.effects.increaseCost({
                    playingTypes: 'play',
                    amount: 1,
                    match: (card, context) => card.getType() === 'action' && 
                        context && context.ability &&
                        context.ability.playTypePlayed() === 'cheatin resolution'
                })
            ]
        });
    }
}

SamBass.code = '23021';

module.exports = SamBass;
