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
            handler: () => {
                this.untilEndOfPhase(ability => ({
                    condition: () => true,
                    match: card => card.getType() === 'deed' && card.control >= 2,
                    effect: [
                        ability.effects.modifyProduction(2),
                        ability.effects.modifyControl(-1)
                        
                    ]
                }), 'upkeep'
                );
            }
        });
    }
}

TheOrphanage.code = '13011';

module.exports = TheOrphanage;
