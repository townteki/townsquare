const SpellCard = require('../../spellcard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class KentuckyWindage extends SpellCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.spellAction({
            title: 'Make dude a stud',
            playType: ['shootout'],
            cost: ability.costs.bootSelf(),
            difficulty: 5,
            onSuccess: (context) => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: this.parent,
                    effect: [
                        ability.effects.setAsStud()
                    ]
                }));
                this.game.addMessage('{0} uses {1} to make {2} a stud', context.player, this, this.parent);
            },
            source: this
        });
        this.spellAction({
            title: 'Give dude +1 bullets',
            playType: ['shootout'],
            cost: ability.costs.bootSelf(),
            difficulty: 6,
            onSuccess: (context) => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: this.parent,
                    effect: [
                        ability.effects.modifyBullets(1)
                    ]
                }));
                this.game.addMessage('{0} uses {1} to give {2} +1 bullets', context.player, this, this.parent);
            },
            source: this
        });        
    }
}

KentuckyWindage.code = '25043';

module.exports = KentuckyWindage;
