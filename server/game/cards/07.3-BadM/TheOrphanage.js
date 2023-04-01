const PhaseNames = require('../../Constants/PhaseNames.js');
const DeedCard = require('../../deedcard.js');

class TheOrphanage extends DeedCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'The Orphanage',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            message: context =>
                this.game.addMessage('{0} uses {1} to give -1 CP and +2 production to all deeds with 2 or more CP',
                    context.player, this),
            handler: context => {
                this.untilEndOfPhase(context.ability, ability => ({
                    targetController: 'any',
                    condition: () => true,
                    match: card => card.getType() === 'deed' && this.getDeedControlWoOrphanage(card) >= 2,
                    effect: [
                        ability.effects.modifyProduction(2),
                        ability.effects.modifyControl(-1)
                        
                    ]
                }), PhaseNames.Upkeep
                );
            }
        });
    }

    getDeedControlWoOrphanage(card) {
        const effects = this.game.effectEngine.getAppliedEffectsOnTarget(card);
        if(effects && effects.some(effect => this.equals(effect.source))) {
            return card.control + 1;
        }
        return card.control;
    }
}

TheOrphanage.code = '13011';

module.exports = TheOrphanage;
