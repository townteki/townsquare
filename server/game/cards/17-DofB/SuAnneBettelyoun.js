const DudeCard = require('../../dudecard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class SuAnneBettelyoun extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.persistentEffect({
            targetController: 'current',
            match: this,
            effect: [
                ability.effects.cannotLeaveShootout('any', context => context.ability && context.ability.isCardAbility())
            ]
        });

        this.action({
            title: 'Make SuAnne a stud',
            playType: ['shootout'],
            repeatable: true,
            limit: 1,
            cost: ability.costs.discardFromHand(),
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: this,
                    effect: [
                        ability.effects.setAsStud()
                    ]
                })); 
                if(context.costs.discardFromHand.hasKeyword('technique')) {
                    this.applyAbilityEffect(context.ability, ability => ({
                        match: this,
                        effect: [
                            ability.effects.modifyBullets(1),
                            ability.effects.modifyValue(1)
                        ]
                    }));
                    this.game.addMessage('{0} uses {1} and discards {2} to make {1} a stud and give her +1 bullets and +1 value', 
                        context.player, this, context.costs.discardFromHand);                    
                } else {
                    this.game.addMessage('{0} uses {1} and discards {2} to make {1} a stud', 
                        context.player, this, context.costs.discardFromHand);
                }
            }
        });
    }
}

SuAnneBettelyoun.code = '25014';

module.exports = SuAnneBettelyoun;
