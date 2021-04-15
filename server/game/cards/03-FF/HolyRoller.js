const SpellCard = require('../../spellcard.js');

class HolyRoller extends SpellCard {
    setupCardAbilities(ability) {
        this.spellAction({
            title: 'Holy Roller',
            playType: 'shootout',
            cost: ability.costs.bootSelf(),
            difficulty: 6,
            onSuccess: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: this.parent,
                    effect: ability.effects.modifyBullets(1)
                }));
                this.lastingEffect(ability => ({
                    until: {
                        onShootoutRoundFinished: () => true
                    },
                    match: this.parent,
                    effect: ability.effects.cannotBeChosenAsCasualty(this,
                        card => card.controller.getOpponent().getTotalRank() - card.controller.getTotalRank() < 3)
                }));
            },
            source: this
        });
    }
}

HolyRoller.code = '05030';

module.exports = HolyRoller;
