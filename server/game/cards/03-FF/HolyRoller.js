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
                this.lastingEffect(context.ability, ability => ({
                    until: {
                        onShootoutRoundFinished: () => true
                    },
                    match: this.parent,
                    effect: ability.effects.cannotBeChosenAsCasualty(this,
                        card => card.controller.getOpponent().getTotalRank() - card.controller.getTotalRank() < 3)
                }));
                this.game.addMessage('{0} uses {1} to give {2} +1 bullets and they cannot be chosen as casualty unless {0} loses by 3 or more ranks', 
                    context.player, this, this.parent);
            },
            source: this
        });
    }
}

HolyRoller.code = '05030';

module.exports = HolyRoller;
