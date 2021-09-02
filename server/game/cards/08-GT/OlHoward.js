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
            message: context =>
                this.game.addMessage('{0} uses {1} to shuffle hand to draw deck and draw a new hand', context.player, this),
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
                                context.player.attach(hauntedDeed, this, 'ability', () =>
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
}

OlHoward.code = '14009';

module.exports = OlHoward;
