const DudeCard = require('../../dudecard.js');

class ElGrajo extends DudeCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Shootout: El Grajo',
            playType: ['shootout'],
            cost: ability.costs.boot({
                type: 'goods',
                condition: card => card.parent === this && card.hasAllOfKeywords(['melee', 'weapon'])
            }),
            handler: context => {
                const elBonus = Math.max(this.bullets + 2 > 4 ? 4 - this.bullets : 2, 0);
                this.applyAbilityEffect(context.ability, ability => ({
                    match: this,
                    effect: [
                        ability.effects.modifyBullets(elBonus),
                        ability.effects.setAsStud()
                    ]
                }));
                this.game.addMessage('{0} uses {1}, booting his {2} to give him +{3} bullets and make him a stud',
                    context.player, this, context.costs.boot, elBonus);
            }
        });
    }
}

ElGrajo.code = '07008';

module.exports = ElGrajo;
