const DeedCard = require('../../deedcard.js');

class CircleMRanch extends DeedCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Circle M Ranch',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            handler: context => {
                if(context.player.hand.length <= 3) {
                    context.player.drawCardsToHand(1);
                    this.game.addMessage('{0} uses {1} to draw a card', context.player, this);
                } else {
                    this.game.addMessage('{0} uses {1}, but does not draw a card because their hand is bigger than 3 cards', context.player, this);
                }
            }
        });
    }
}

CircleMRanch.code = '01069';

module.exports = CircleMRanch;
