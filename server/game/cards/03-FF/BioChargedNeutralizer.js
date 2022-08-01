const GoodsCard = require('../../goodscard.js');

class BioChargedNeutralizer extends GoodsCard {
    constructor(owner, cardData) {
        super(owner, cardData, { providesStudBonus: true });
    }

    setupCardAbilities(ability) {
        this.persistentEffect({
            match: this,
            effect: [
                ability.effects.cannotBeTraded(),
                ability.effects.cannotBeAffected('opponent', context => context.ability && context.ability.isCardAbility())
            ]
        });
    }
}

BioChargedNeutralizer.code = '05026';

module.exports = BioChargedNeutralizer;
