const DudeCard = require('../../dudecard.js');

class TheMixer extends DudeCard {
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
                this.game.addMessage('{0} uses {1} to make {2} ignore all bullet modifiers', 
                    context.player, this, context.target),
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.target,
                    effect: [
                        ability.effects.ignoreBulletModifiers('any', context => context.source.getType() !== 'goods' || context.source.parent !== context.card)
                    ]
                }));
            }
        });
    }
}

TheMixer.code = '16003';

module.exports = TheMixer;
