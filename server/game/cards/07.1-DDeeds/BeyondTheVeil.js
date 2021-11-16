const GameActions = require('../../GameActions/index.js');
const OutfitCard = require('../../outfitcard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class BeyondTheVeil extends OutfitCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => true,
            match: card => card.location === 'play area' &&
                card.getType() === 'dude' && 
                card.locationCard &&
                card.locationCard.hasAttachmentWithKeywords(['totem']),
            effect: [
                ability.effects.modifyInfluence(1)
            ]
        });
        
        this.action({
            title: 'Noon: Beyond the Veil',
            playType: ['noon'],
            cost: [
                ability.costs.bootSelf(),
                ability.costs.boot((card, context) => card.parent &&
                    card.controller === this.owner &&
                    card.hasKeyword('totem') &&
                    (!context.target || card.gamelocation !== context.target.gamelocation))
            ],
            target: {
                activePromptTitle: 'Choose a dude to move',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'current'
                },
                cardType: ['dude'],
                gameAction: 'moveDude'
            },
            handler: context => {
                this.game.resolveGameAction(GameActions.moveDude({ 
                    card: context.target, 
                    targetUuid: context.costs.boot.gamelocation 
                }), context).thenExecute(() => {
                    this.game.addMessage('{0} uses {1} and boots {2} to move {3} to {4}', 
                        context.player, this, context.costs.boot, context.target, context.costs.boot.parent);
                });
            }
        });
    }
}

BeyondTheVeil.code = '11002';

module.exports = BeyondTheVeil;
