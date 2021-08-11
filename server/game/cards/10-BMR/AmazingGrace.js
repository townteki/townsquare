const SpellCard = require('../../spellcard.js');

class AmazingGrace extends SpellCard {
    setupCardAbilities(ability) {
        this.spellAction({
            title: 'Amazing Grace',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            difficulty: 6,
            onSuccess: (context) => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: this.parent,
                    effect: [
                        ability.effects.modifyInfluence(1),
                        ability.effects.cannotDecreaseInfluence('opponent', context => 
                            context.ability && context.ability.isCardAbility())
                    ]
                }));
                this.lastingEffect(context.ability, ability => ({
                    until: {
                        onDudeRejectedCallOut: event => event.callee === this.parent,
                        onRoundEnded: () => true
                    },
                    match: this.parent,
                    effect: ability.effects.canRefuseWithoutGoingHomeBooted()
                }));
                this.applyAbilityEffect(context.ability, ability => ({
                    match: this.game.getDudesInPlay(this.controller).filter(dude => dude !== this.parent),
                    effect: [
                        ability.effects.modifyDeedInfluence(1),
                        ability.effects.cannotDecreaseInfluence('opponent', context => 
                            context.ability && context.ability.isCardAbility())
                    ]
                }));
                this.game.addMessage('{0} uses {1} to give {2} +1 influence and +1 influence for controlling deeds to their other dudes', 
                    context.player, this, this.parent);
            },
            source: this
        });
    }
}

AmazingGrace.code = '18033';

module.exports = AmazingGrace;
