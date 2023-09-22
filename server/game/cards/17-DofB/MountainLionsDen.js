const SpellCard = require('../../spellcard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class MountainLionsDen extends SpellCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.spellAction({
            title: 'Give posse +1 bullets',
            playType: ['shootout'],
            cost: ability.costs.bootSelf(),
            difficulty: 6,
            onSuccess: (context) => {
                const posse = this.game.shootout.getPosseByPlayer(context.player);
                this.applyAbilityEffect(context.ability, ability => ({
                    match: posse.getDudes(),
                    effect: [
                        ability.effects.modifyBullets(1),
                        ability.effects.cannotDecreaseBullets('opponent', context => 
                            context.ability && context.ability.isCardAbility()),
                        ability.effects.cannotBeSetToDraw('opponent', context => 
                            context.ability && context.ability.isCardAbility())
                    ]
                }));      
                this.game.addMessage('{0} uses {1} to give each dude in their posse +1 bullets, and their bullets cannot be affected', 
                    context.player, this);          
            },
            source: this
        });
    }
}

MountainLionsDen.code = '25047';

module.exports = MountainLionsDen;
