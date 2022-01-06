const DudeCard = require('../../dudecard.js');

class HattieDeLorre2 extends DudeCard {
    setupCardAbilities() {
        this.action({
            title: 'Hattie DeLorre',
            playType: ['shootout'],
            target: {
                activePromptTitle: 'Select a dude',
                cardCondition: { location: 'play area', controller: 'opponent', participating: true, wanted: true },
                cardType: ['dude']
            },
            message: context => this.game.addMessage('{0} uses {1} to reduce {2}\'s bullets by 3', context.player, this, context.target),
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.target,
                    effect: [
                        ability.effects.modifyBullets(-3)
                    ]
                }));
            }
        });
    }
}

HattieDeLorre2.code = '24076';

module.exports = HattieDeLorre2;
