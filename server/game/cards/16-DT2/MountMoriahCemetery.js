const DeedCard = require('../../deedcard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class MountMoriahCemetery extends DeedCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.persistentEffect({
            targetController: 'current',
            effect: ability.effects.reduceCost({
                playingTypes: ['play', 'shoppin'],
                amount: 1,
                match: (card, context) => card.getType() === 'spell' &&
                    context.target && context.target.gamelocation === this.uuid
            })
        });
    }

    isSpellcasterHere(spell) {
        return this.locationCard && this.locationCard.getDudes(dude => dude.canPerformSkillOn(spell)).length > 0;
    }
}

MountMoriahCemetery.code = '24120';

module.exports = MountMoriahCemetery;
