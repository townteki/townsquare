const DeedCard = require('../../deedcard.js');

class CrystalPalace extends DeedCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            targetController: 'any',
            condition: () => true,
            match: card => card.getType() === 'dude' && card.hasKeyword('abomination') && this.equals(card.locationCard),
            effect: [
                ability.effects.modifyBullets(1),
                ability.effects.modifyInfluence(1)
            ]
        });
    }
}

CrystalPalace.code = '22034';

module.exports = CrystalPalace;
