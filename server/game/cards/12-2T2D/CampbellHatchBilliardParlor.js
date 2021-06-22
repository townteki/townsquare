const DeedCard = require('../../deedcard.js');

class CampbellHatchBilliardParlor extends DeedCard {
    setupCardAbilities(ability) {
        this.reaction({
            title: 'Campbell & Hatch Billiard Parlor',
            when: {
                onPossesFormed: () => true
            },
            cost: ability.costs.bootSelf(),
            message: context => 
                this.game.addMessage('{0} uses {1} to prevent hand rank modifications, and to prevent discaring and acing of dudes during first round', 
                    context.player, this),
            handler: context => {
                this.applyAbilityEffect(context.ability, ability => ({
                    match: this.game.getPlayers(),
                    effect: [
                        ability.effects.cannotModifyHandRanks(this, context => context.ability && 
                            ['shootout', 'resolution', 'react'].includes(context.ability.playTypePlayed()))
                    ]
                }));
                this.lastingEffect(ability => ({
                    until: {
                        onShootoutRoundFinished: () => true,
                        onShootoutPhaseFinished: () => true
                    },
                    match: this.game.shootout,
                    effect: [
                        ability.effects.cannotBeAced('any', context => this.abilityProtectCondition(context)),
                        ability.effects.cannotBeDiscarded('any', context => this.abilityProtectCondition(context))
                    ]
                }));
            }
        });
    }

    abilityProtectCondition(context) {
        return context.ability && 
            ['shootout', 'resolution'].includes(context.ability.playTypePlayed());
    }
}

CampbellHatchBilliardParlor.code = '20031';

module.exports = CampbellHatchBilliardParlor;
