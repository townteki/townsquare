const DudeCard = require('../../dudecard.js');

class CharleyBull extends DudeCard {
    setupCardAbilities() {
        this.action({
            title: 'Reduce bullets',
            playType: ['shootout'],
            target: {
                activePromptTitle: 'Choose dude to reduce bullets',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'opponent', 
                    participating: true 
                },
                cardType: ['dude']
            },
            message: context => 
                this.game.addMessage('{0} uses {1} to reduce {2}\'s bullets by {3}', context.player, this, context.target, this.influence),
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: context.target,
                    effect: [
                        ability.effects.modifyBullets(this.influence * -1)
                    ]
                }));
            }
        });
    }
}

CharleyBull.code = '25016';

module.exports = CharleyBull;
