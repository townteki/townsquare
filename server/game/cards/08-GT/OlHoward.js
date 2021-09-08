const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');
const StandardActions = require('../../PlayActions/StandardActions.js');

class OlHoward extends DudeCard {
    setupCardAbilities(ability) {
        this.whileAttached({
            effect: [
                ability.effects.setControl(0),
                ability.effects.setProduction(0),                
                ability.effects.cannotIncreaseControl('any', context => context.source !== this),
                ability.effects.cannotDecreaseControl('any', context => context.source !== this),
                ability.effects.cannotIncreaseProduction('any', context => context.source !== this),
                ability.effects.cannotDecreaseProduction('any', context => context.source !== this)
            ]
        });

        this.reaction({
            title: 'React: Ol\' Howard',
            grifter: true,
            handler: context => {
                this.game.resolveGameAction(
                    GameActions.search({
                        title: 'Select a deed for Ol\'Howard to haunt',
                        match: { type: 'deed' },
                        location: ['draw deck'],
                        numToSelect: 1,
                        message: {
                            format: '{player} plays {source} and searches their draw deck to put {searchTarget} into play'
                        },
                        cancelMessage: {
                            format: '{player} plays {source} and searches their draw deck, but does not find a deed'
                        },
                        handler: hauntedDeed => {
                            this.game.resolveStandardAbility(StandardActions.putIntoPlay({
                                playType: 'ability',
                                abilitySourceType: 'card'
                            }, () => {
                                context.player.attach(this, hauntedDeed, 'ability', () =>
                                    this.game.addMessage('{0} sends {1} to haunt {2}', context.player, this, hauntedDeed));
                            }), context.player, hauntedDeed);
                        },
                        source: this
                    }),
                    context
                ); 
            }
        });
    }

    canAttach(player, card) {
        if(this.game.currentPhase !== 'setup') {
            return false;
        }

        return card.getType() === 'deed';
    }    
}

OlHoward.code = '14009';

module.exports = OlHoward;
