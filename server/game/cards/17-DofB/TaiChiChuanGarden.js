const DeedCard = require('../../deedcard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class TaiChiChuanGarden extends DeedCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.reaction({
            title: 'React: Draw a card and discard a card',
            when: {
                onPullSuccess: event => this.controller.equals(event.pullingDude.controller)
            },
            cost: [ability.costs.bootSelf()],
            handler: context => {
                context.player.drawCardsToHand(1, context).thenExecute(() => {
                    context.player.discardFromHand(1, discarded => {
                        this.game.addMessage('{0} uses {1} to draw a card and discard {2}', 
                            context.player, this, discarded);
                    }, {}, context);
                });                
            }
        });
    }
}

TaiChiChuanGarden.code = '25036';

module.exports = TaiChiChuanGarden;
