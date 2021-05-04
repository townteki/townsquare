const SpellCard = require('../../spellcard.js');

class OnwardChristianSoldiers extends SpellCard {
    setupCardAbilities(ability) {
        this.spellAction({
            title: 'Onward Christian Soldiers',
            playType: ['shootout'],
            cost: ability.costs.bootSelf(),
            difficulty: 4,
            onSuccess: (context) => {
                const posse = this.game.shootout.getPosseByPlayer(context.player);
                if(posse) {
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
                }
            },
            source: this
        });
    }
}

OnwardChristianSoldiers.code = '14028';

module.exports = OnwardChristianSoldiers;
