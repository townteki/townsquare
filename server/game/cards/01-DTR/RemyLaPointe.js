const DudeCard = require('../../dudecard.js');

class RemyLaPointe extends DudeCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Rémy LaPointe',
            playType: ['shootout'],
            cost: [
                ability.costs.payXGhostRock(() => 1, () => 5 - (this.bullets < 1 ? 1 : this.bullets))
            ],
            message: context => this.game.addMessage('{0} uses {1} to boost his bullets by {2}', 
                context.player, this, context.grCost),
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: this,
                    effect: [
                        ability.effects.modifyBullets(context.grCost)
                    ]
                }));
            }
        });
    }
}

RemyLaPointe.code = '01033';

module.exports = RemyLaPointe;
