const OutfitCard = require('../../outfitcard.js');

class BayouVermilionRailroad extends OutfitCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            targetController: 'current',
            effect: ability.effects.reduceFirstPlayedCardCostEachRound(1, card => card.hasKeyword('mystical'))
        });
        this.action({
            title: 'Bayou Vermilion Railroad',
            playType: 'noon',
            cost: ability.costs.bootSelf(),        
            target: {
                activePromptTitle: 'Select a Mystical card',
                cardCondition: { 
                    location: 'play area',
                    condition: card => card.hasKeyword('mystical') && card.getGameLocation().isDeed() && !card.booted && card.canBeBooted()
                }
            },
            handler: context => {
                this.untilEndOfPhase(context.ability, ability => ({
                    condition: () => true,
                    match: context.target.getGameLocation(),
                    effect: [
                        ability.effects.modifyProduction(0),
                        ability.effect.modifyControl(0)
                    ]
                }), 'upkeep');
                
            },
            source: this
        });
    }
}

BayouVermilionRailroad.code = '21003';

module.exports = BayouVermilionRailroad;
