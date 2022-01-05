const DeedCard = require('../../deedcard.js');

class HuntsmensSociety extends DeedCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            targetController: 'current',
            condition: () => true,
            match: card => card.getType() === 'dude' &&
                (card.gamelocation === this.gamelocation || card.isAdjacent(this.gamelocation)) &&
                card.value >= 10,
            effect: ability.effects.modifyUpkeep(-1)
        });
    }
}

HuntsmensSociety.code = '07010';

module.exports = HuntsmensSociety;
