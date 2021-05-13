const DeedCard = require('../../deedcard.js');

class HunstmensSociety extends DeedCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            targetController: 'current',
            condition: () => true,
            match: card => card.getType() === 'dude' &&
                (card.locationCard === this || card.isAdjacent(this.gamelocation)) &&
                card.value >= 10,
            effect: ability.effects.modifyUpkeep(-1)
        });
    }
}

HunstmensSociety.code = '07010';

module.exports = HunstmensSociety;
