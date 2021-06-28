const GoodsCard = require('../../goodscard.js');

class Claws extends GoodsCard {
    constructor(owner, cardData) {
        super(owner, cardData, true);
    }

    setupCardAbilities(ability) {
        this.attachmentRestriction({ keyword: ['harrowed', 'abomination'] });

        this.whileAttached({
            condition: () => !this.meleeWeaponCondition(),
            effect: ability.effects.setAsStud()
        });

        this.persistentEffect({
            match: this,
            effect: ability.effects.cannotBeAffected('opponent', context => context.ability && context.ability.isCardAbility())
        });
    }
}

Claws.code = '20039';

module.exports = Claws;
