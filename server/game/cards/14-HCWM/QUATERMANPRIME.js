const DudeCard = require('../../dudecard.js');

class QUATERMANPRIME extends DudeCard {
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
        
        this.traitReaction({
            when: {
                onDrawHandsRevealed: event => event.shootout && this.isParticipating()
            },
            handler: () => {
                this.game.getPlayers().forEach(player => {
                    if(player.isCheatin()) {
                        player.modifyCasualties(1);
                        this.game.addMessage('{0} will suffer additional casualty thanks to {1}', player, this);
                    }
                });
            }
        });        
    }

    isValidSource(source) {
        return source && source.getType() === 'goods' && 
            source.parent === this;
    }
}

QUATERMANPRIME.code = '22029';

module.exports = QUATERMANPRIME;
