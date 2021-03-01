const ActionCard = require('../../actioncard.js');

class HidingInTheShadows extends ActionCard {
    setupCardAbilities() {
        this.action({
            title: 'Hiding in the Shadows',
            playType: ['noon'],
            target: {
                activePromptTitle: 'Select your dude to hide in shadows',
                cardCondition: { location: 'play area' },
                cardType: ['dude']
            },
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.target,
                    effect: [
                        ability.effects.cannotBeTargetedByShootout('opponent'),
                        ability.effects.cannotBeAffectedByShootout('opponent')
                    ]
                }));                
                this.game.addMessage('{0} uses {1} to hide {2}.', context.player, this, context.target);
            }
        });
    }
}

HidingInTheShadows.code = '01118';

module.exports = HidingInTheShadows;
