const OutfitCard = require('../../outfitcard.js');
const GameActions = require('../../GameActions/index.js');

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
                this.game.resolveGameAction(GameActions.bootCard({ card: context.target }), context);
                context.player.modifyGhostRock(1);
                this.untilEndOfPhase(context.ability, ability => ({
                    condition: () => true,
                    match: card => context.target.getGameLocation().uuid === card.uuid,
                    effect: [
                        ability.effects.setProduction(0),
                        ability.effects.setControl(0)
                    ]
                }), 'upkeep');

            },
            source: this
        });
    }
}

BayouVermilionRailroad.code = '21003';

module.exports = BayouVermilionRailroad;
