const DeedCard = require('../../deedcard.js');

class TheOrphanage extends DeedCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'The Orphanage',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            handler: context => {
                this.untilEndOfPhase(ability => ({
                    condition: () => true,
                    match: card => card.getType() === 'deed' && card.control >= 2,
                    effect: [
                        ability.effects.modifyProduction(2),
                        ability.effects.modifyControl(-1)
                        
                    ]
                }), 'upkeep'
                );
                this.game.addMessage('{0} uses {1} to give -1 control point and +2 production to all deeds with 2 or more control points.',
                    context.player, this);
            }
        });
    }
}

TheOrphanage.code = '13011';

module.exports = TheOrphanage;
