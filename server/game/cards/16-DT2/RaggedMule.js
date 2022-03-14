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
                this.game.addMessage('{0} uses {1} to move {2} to {3}', 
                    context.player, this, this.getDudeToMove(context), context.target),
            handler: context => {
                let dudeToMove = this.getDudeToMove(context);
                if(dudeToMove) {
                    this.game.resolveGameAction(GameActions.moveDude({ 
                        card: dudeToMove, 
                        targetUuid: context.target.uuid 
                    }), context); 
                }
            }
        });

        this.action({
            title: 'Shootout: Join Dude to posse',
            playType: ['shootout:join'],
            cost: [
                ability.costs.bootSelf(),
                ability.costs.choose({
                    'Pay 1 Ghost Rock': ability.costs.payGhostRock(1),
                    'Discard Ragged Mule': ability.costs.discardSelf()
                })
            ],
            actionContext: { card: this.parent, gameAction: 'joinPosse'},
            message: context => 
                this.game.addMessage('{0} uses {1} to join {2} to posse', context.player, this, this.getDudeToMove(context)),
            handler: context => {
                let dudeToMove = this.getDudeToMove(context);
                if(dudeToMove) {
                    this.game.resolveGameAction(GameActions.joinPosse({ card: dudeToMove }), context);
                }
            }
        });        
    }

    getDudeToMove(context) {
        let dudeToMove = this.parent;
        if(!dudeToMove && context.costs && context.costs.savedCardsInfo) {
            const savedParents = context.costs.savedCardsInfo.filter(cardInfo => cardInfo.parent).map(cardInfo => cardInfo.parent);
            if(savedParents.length) {
                dudeToMove = savedParents[0];
            }
        }
        return dudeToMove;
    }
}

RaggedMule.code = '24166';

module.exports = RaggedMule;
