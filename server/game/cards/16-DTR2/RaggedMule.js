const GameActions = require('../../GameActions/index.js');
const GoodsCard = require('../../goodscard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class RaggedMule extends GoodsCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.action({
            title: 'Noon: Move Dude',
            playType: ['noon'],
            cost: [
                ability.costs.bootSelf(),
                ability.costs.choose({
                    'Pay 1 Ghost Rock': ability.costs.payGhostRock(1),
                    'Discard Ragged Mule': ability.costs.discardSelf()
                })
            ],
            target: { cardType: 'location' },
            actionContext: { card: this.parent, gameAction: 'moveDude'},
            message: context => 
                this.game.addMessage('{0} uses {1} to move {2} to {3}', context.player, this, this.parent, context.target),
            handler: context => {
                this.game.resolveGameAction(GameActions.moveDude({ card: this.parent, targetUuid: context.target.uuid }), context); 
            }
        });

        this.action({
            title: 'Shootout: Join Dude to posse',
            playType: ['shootout'],
            cost: [
                ability.costs.bootSelf(),
                ability.costs.choose({
                    'Pay 1 Ghost Rock': ability.costs.payGhostRock(1),
                    'Discard Ragged Mule': ability.costs.discardSelf()
                })
            ],
            actionContext: { card: this.parent, gameAction: 'joinPosse'},
            message: context => 
                this.game.addMessage('{0} uses {1} to join {2} to posse', context.player, this, this.parent),
            handler: context => {
                this.game.resolveGameAction(GameActions.joinPosse({ card: this.parent }), context);
            }
        });        
    }
}

RaggedMule.code = '25204';

module.exports = RaggedMule;
