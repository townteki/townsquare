const SpellCard = require('../../spellcard.js');

class ShieldOfFaith extends SpellCard {
    setupCardAbilities(ability) {
        this.spellAction({
            title: 'Shield of Faith',
            playType: 'shootout',
            cost: ability.costs.bootSelf(),
            difficulty: 7,
            onSuccess: (context) => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: this.game.shootout,
                    effect: [
                        ability.effects.cannotBeAced('any', context => this.abilityProtectCondition(context)),
                        ability.effects.cannotBeDiscarded('any', context => this.abilityProtectCondition(context))
                    ]
                })); 
                context.player.modifyCasualties(-1);
                this.game.addMessage('{0} uses {1} to reduce their casualties this round by 1. Dudes cannot be aced or discarded during this shootout, ' +
                    'except as a casualty for losing the round or due to their owner\'s card abilities or traits', context.player, this, context.target);
            },
            source: this
        });
    }

    abilityProtectCondition(context) {
        return context && (
            (!context.isCasualty && context.player !== context.card.controller) || 
            (context.shootout && context.shootout.loser !== context.card.controller)
        );
    }
}

ShieldOfFaith.code = '06018';

module.exports = ShieldOfFaith;
