const OutfitCard = require('../../outfitcard.js');
const GameActions = require('../../GameActions/index.js');
const PhaseNames = require('../../Constants/PhaseNames.js');

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
                    controller: 'current',
                    booted: false,
                    condition: card => card.hasKeyword('mystical') && card.isAtDeed()
                },
                gameAction: 'boot'
            },
            handler: context => {
                this.game.resolveGameAction(GameActions.bootCard({ card: context.target }), context);
                context.player.modifyGhostRock(1);
                this.game.addMessage('{0} gains 1 GR from {1}', context.player, this);
                context.game.promptForYesNo(context.player, {
                    title: 'Do you want to reduce ' + context.target.locationCard.title + '\'s CP and production to 0?',
                    onYes: () => {
                        this.untilEndOfPhase(context.ability, ability => ({
                            match: context.target.locationCard,
                            effect: [
                                ability.effects.setProduction(0),
                                ability.effects.setControl(0)
                            ]
                        }), PhaseNames.Upkeep);
                        this.game.addMessage('{0} uses {1} to reduce {2}\'s CP and production to 0 until after Upkeep', context.player, this, context.target.locationCard);
                    }
                });
            },
            source: this
        });
    }
}

BayouVermilionRailroad.code = '21003';

module.exports = BayouVermilionRailroad;
