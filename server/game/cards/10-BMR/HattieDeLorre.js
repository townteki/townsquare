const DudeCard = require('../../dudecard.js');

class HattieDeLorre extends DudeCard {
    setupCardAbilities() {
        this.action({
            title: 'Hattie DeLorre',
            playType: ['shootout'],
            target: {
                activePromptTitle: 'Select a dude',
                cardCondition: { location: 'play area', controller: 'opponent', participating: true, wanted: true },
                cardType: ['dude']
            },
            message: context => this.game.addMessage('{0} uses {1} to reduce {2}\'s bullets by 5', context.player, this, context.target),
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.target,
                    effect: [
                        ability.effects.modifyBullets(-5)
                    ]
                }));
            }
        });
    }
}

HattieDeLorre.code = '18016';

module.exports = HattieDeLorre;
