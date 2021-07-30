const DeedCard = require('../../deedcard.js');

class Hustings extends DeedCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            targetController: 'any',
            condition: () => true,
            match: card => card.getType() === 'dude' && 
                card.controller !== this.controller &&
                !card.booted && 
                this.game.isHome(card.gamelocation, card.controller),
            effect: [
                ability.effects.modifyInfluence(-1)
            ]
        });
    }
}

Hustings.code = '03011';

module.exports = Hustings;
