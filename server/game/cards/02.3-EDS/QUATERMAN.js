const DudeCard = require('../../dudecard.js');

class QUATERMAN extends DudeCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            match: this,
            effect: [
                ability.effects.cannotIncreaseBullets('any', context => !this.isValidSource(context.source)),
                ability.effects.cannotDecreaseBullets('any', context => !this.isValidSource(context.source)),
                ability.effects.cannotBeSetToDraw('any', context => !this.isValidSource(context.source)),
                ability.effects.cannotBeBooted('any', context => context.ability && context.ability.isCardAbility()),
                ability.effects.cannotBeMoved('any', context => context.ability && context.ability.isCardAbility())                
            ]
        });
    }

    isValidSource(source) {
        return source && source.getType() === 'goods' && 
            source.parent === this;
    }
}

QUATERMAN.code = '04010';

module.exports = QUATERMAN;
