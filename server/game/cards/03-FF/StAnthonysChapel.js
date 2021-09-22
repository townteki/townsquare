const DeedCard = require('../../deedcard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class StAnthonysChapel extends DeedCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.persistentEffect({
            targetController: 'any',
            condition: () => true,
            match: card => card.location === 'play area' &&
                card.gamelocation === this.uuid &&
                card.hasKeyword('abomination'),
            effect: ability.effects.modifyBullets(-1)
        });

        this.persistentEffect({
            condition: () => true,
            match: card => card.location === 'play area' &&
                card.gamelocation === this.uuid &&
                card.getType() === 'dude',
            effect: ability.effects.modifySkillRating('anySkill', 1)
        });
    }
}

StAnthonysChapel.code = '05022';

module.exports = StAnthonysChapel;
