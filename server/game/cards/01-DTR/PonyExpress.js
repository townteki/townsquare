const DeedCard = require('../../deedcard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class PonyExpress extends DeedCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.action({
            title: 'Noon: Pony Express',
            playType: ['noon'],
            cost: [
                ability.costs.bootSelf(),
                ability.costs.discardFromHand()
            ],
            message: context => 
                this.game.addMessage('{0} uses {1} to discard {2} from hand and draw a card', 
                    context.player, this, context.costs.discardFromHand),
            handler: context => {
                context.player.drawCardsToHand(1, context);
            }
        });
    }
}

PonyExpress.code = '01056';

module.exports = PonyExpress;
