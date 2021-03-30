const DeedCard = require('../../deedcard.js');

class Bunkhouse extends DeedCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            targetController: 'any',
            condition: () => true,
            match: card => card.getType() === 'dude' && 
                card.locationCard === this &&
                !this.isAffectedByBunkhouse(card) &&
                (card.influence === 0 || card.influence === 1),
            effect: [
                ability.effects.modifyInfluence(1)
            ]
        });
    }

    isAffectedByBunkhouse(card) {
        return card.abilities.persistentEffects.find(effect => effect.source === this);
    }
}

Bunkhouse.code = '01071';

module.exports = Bunkhouse;
