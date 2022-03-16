const DeedCard = require('../../deedcard.js');

class CattleMarket extends DeedCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.game.findCardsInPlay(card => 
                !card.equals(this) &&
                card.getType() === 'deed' && 
                card.hasKeyword('Ranch')).length > 0,
            match: this,
            effect: [
                ability.effects.modifyControl(1)
            ]
        });
        this.persistentEffect({
            targetController: 'any',
            condition: () => true,
            match: card => card.getType() === 'dude' && this.equals(card.locationCard),
            effect: [
                ability.effects.modifyValue(3)
            ]
        });
    }
}

CattleMarket.code = '01068';

module.exports = CattleMarket;
