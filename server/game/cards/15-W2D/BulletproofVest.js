const GameActions = require('../../GameActions/index.js');
const GoodsCard = require('../../goodscard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class BulletproofVest extends GoodsCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.whileAttached({
            effect: ability.effects.cannotBootToJoin()
        });
        
        this.action({
            title: 'Resolution: Bulletproof Vest',
            playType: ['resolution'],
            cost: [
                ability.costs.bootSelf(),
                ability.costs.discardFromHand()
            ],
            handler: context => {
                this.game.resolveGameAction(GameActions.decreaseCasualties({ 
                    player: context.player, 
                    amount: 1 
                }), context).thenExecute(() => {
                    this.game.addMessage('{0} uses {1} and discards {2} to reduce their casualties by 1', 
                        context.player, this, context.costs.discardFromHand);
                });
            }
        });
    }
}

BulletproofVest.code = '23038';

module.exports = BulletproofVest;
