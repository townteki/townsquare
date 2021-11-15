const GameActions = require('../../GameActions/index.js');
const OutfitCard = require('../../outfitcard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class GatewayToBeyond extends OutfitCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.action({
            title: 'Noon: Gateway to Beyond',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            handler: context => {
                const controlledHolyGrounds = context.player.cardsInPlay.reduce((total, card) => 
                    card.hasKeyword('holy ground') ? total + 1 : total, 0);
                context.ability.selectAnotherTarget(context.player, context, {
                    activePromptTitle: `Choose up to ${controlledHolyGrounds} spirits`,
                    cardCondition: { 
                        location: 'play area', 
                        controller: 'current', 
                        keyword: 'spirit' 
                    },
                    cardType: ['spell'],
                    gameAction: 'unboot',
                    multiSelect: true,
                    numCards: controlledHolyGrounds,
                    onSelect: (player, spirits) => {
                        let action = GameActions.simultaneously(
                            spirits.map(spirit => GameActions.unbootCard({ card: spirit }))
                        );
                        this.game.resolveGameAction(action, context).thenExecute(() => {
                            spirits.forEach(spirit => spirit.resetAbilities());                            
                            this.game.addMessage('{0} uses {1} to unboot {2} and their abilities can be used again this turn', 
                                player, this, spirits);
                        });                        
                        return true;
                    },
                    source: this,
                    context
                });
            }
        });
    }
}

GatewayToBeyond.code = '18002';

module.exports = GatewayToBeyond;
