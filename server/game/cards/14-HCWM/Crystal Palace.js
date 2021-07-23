const DeedCard = require('../../deedcard.js');

class CrystalPalace extends DeedCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => true,
            match: card => card.getType() === 'dude' && card.hasKeyword('abomination') && card.locationCard === this,
            effect: [
                ability.effects.modifyBullets(1),
                ability.effects.modifyInfluence(1)
            ]
        });
    }
}

CrystalPalace.code = '22034';

module.exports = CrystalPalace;
