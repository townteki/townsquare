const GoodsCard = require('../../goodscard.js');

class LegalInstruments extends GoodsCard {
    setupCardAbilities(ability) {
        this.attachmentRestriction(card => 
            card.controller.equals(this.controller) &&
            !card.booted && (card.getType() === 'deed') &&
            !card.hasKeyword('out of town')
        );
        this.whileAttached({
            condition: () => this.parent.getType() === 'deed',
            effect: ability.effects.addKeyword('Government')
        });
        this.persistentEffect({
            condition: () => this.parent && this.parent.getType() === 'deed',
            match: card => card.getType() === 'dude' &&
                card.hasKeyword('deputy') &&
                this.parent.equals(card.locationCard),
            effect: [
                ability.effects.modifyInfluence(2),
                ability.effects.modifyValue(3)
            ]
        });
    }
}

LegalInstruments.code = '06013';

module.exports = LegalInstruments;
