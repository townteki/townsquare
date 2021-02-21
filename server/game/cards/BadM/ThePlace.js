const DeedCard = require('../../deedcard.js');

class ThePlace extends DeedCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            targetController: 'any',
            condition: () => true,
            match: card => card.getType() === 'deed' && !card.isSameStreet(this) && card.owner.leftmostLocation() === card.getGameLocation(),
            effect: ability.effects.modifyProduction(2)
        });
    }
}

ThePlace.code = '13012';

module.exports = ThePlace;
