const ActionCard = require('../../actioncard.js');

class SunInYerEyes extends ActionCard {
    setupCardAbilities() {
        this.action({
            title: 'Sun in Yer Eyes',
            playType: 'shootout',
            target: {
                activePromptTitle: 'Select dude who has sun in his eyes',
                cardCondition: { location: 'play area', participating: true, controller: 'opponent' },
                cardType: 'dude'
            },
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.target,
                    effect: [
                        ability.effects.setAsDraw(),
                        ability.effects.modifyBullets(-2)
                    ]
                }));
                this.game.addMessage('{0} plays {1} on {2} to lower their bullets by 2 and make them a draw.', context.player, this, context.target);
            }
        });
    } 
}

SunInYerEyes.code = '01113';

module.exports = SunInYerEyes;