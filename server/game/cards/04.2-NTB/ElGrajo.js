const DudeCard = require('../../dudecard.js');

class ElGrajo extends DudeCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Shootout: El Grajo',
            playType: ['shootout'],
            cost: ability.costs.boot({
                type: 'goods',
                condition: card => card.parent === this && card.hasKeyword('melee') && card.hasKeyword('weapon')
            }),
            handler: context => {
                let elBonus = 4 - this.bullets;
                if(elBonus < 0) {elBonus = 0;}
                if(elBonus > 2) {elBonus = 2;}
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
