const DeedCard = require('../../deedcard.js');

class CircleMRanch extends DeedCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Circle M Ranch',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            ifCondition: context => context.player.hand.length <= 3,
            ifFailMessage: context =>
                this.game.addMessage('{0} uses {1}, but does not draw a card because their hand is bigger than 3 cards', context.player, this),
            message: context =>
                this.game.addMessage('{0} uses {1} to draw a card', context.player, this),
            handler: context => {
                context.player.drawCardsToHand(1, context);
            }
        });
    }
}

CircleMRanch.code = '01069';

module.exports = CircleMRanch;
