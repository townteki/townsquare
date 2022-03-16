const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

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
            handler: context => {
                this.game.getPlayers().forEach(player => {
                    if(player.isCheatin()) {
                        this.game.resolveGameAction(GameActions.increaseCasualties({ 
                            player: player, 
                            amount: 1
                        }), context).thenExecute(() => {
                            this.game.addMessage('{0} will suffer additional casualty thanks to {1}', player, this);
                        });                        
                    }
                });
            }
        });        
    }

    isValidSource(source) {
        return source && source.getType() === 'goods' && 
            this.equals(source.parent);
    }
}

QUATERMANPRIME.code = '22029';

module.exports = QUATERMANPRIME;
