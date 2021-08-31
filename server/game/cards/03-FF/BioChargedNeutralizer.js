const GoodsCard = require('../../goodscard.js');

class BioChargedNeutralizer extends GoodsCard {
    setupCardAbilities(ability) {
        this.whileAttached({
            effect: ability.effects.setAsStud()
        });
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
