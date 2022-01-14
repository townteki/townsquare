const DudeCard = require('../../dudecard');

class TheMixer2 extends DudeCard {
    setupCardAbilities() {
        this.action({
            title: 'The Mixer',
            playType: ['shootout'],
            target: {
                activePromptTitle: 'Choose a dude',
                cardCondition: { location: 'play area', controller: 'any', participating: true },
                cardType: ['dude']
            },
            message: context => 
                this.game.addMessage('{0} uses {1} to make {2} ignore all opponent bullet modifiers', 
                    context.player, this, context.target),
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.target,
                    effect: [
                        ability.effects.ignoreBulletModifiers('opponent', context => 
                            context.source.getType() === 'action' || (context.ability && context.ability.isCardAbility()))
                    ]
                }));
            }
        });
    }
}

TheMixer2.code = '24056';

module.exports = TheMixer2;
