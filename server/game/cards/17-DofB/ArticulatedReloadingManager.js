const GameActions = require('../../GameActions');
const GoodsCard = require('../../goodscard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class ArticulatedReloadingManager extends GoodsCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.attachmentRestriction(card => 
            card.controller.equals(this.controller) &&
            card.getType() === 'dude' &&
            !card.hasAttachment(att => !att.equals(this) && att.code === '25040'));

        this.action({
            title: 'Unboot a card',
            playType: ['noon', 'shootout'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose goods to unboot',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'current', 
                    condition: card => card.parent && card.parent.equals(this.parent)
                },
                cardType: ['goods']
            },
            message: context => 
                this.game.addMessage('{0} uses {1} to unboot {2} and reset its abilities', 
                    context.player, this, context.target),
            handler: context => {
                this.game.resolveGameAction(GameActions.unbootCard({ card: context.target }), context);
                context.target.resetAbilities();
            }
        });
    }
}

ArticulatedReloadingManager.code = '25040';

module.exports = ArticulatedReloadingManager;
