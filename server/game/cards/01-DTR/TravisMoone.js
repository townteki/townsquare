const DudeCard = require('../../dudecard.js');

class TravisMoone extends DudeCard {
    setupCardAbilities(ability) {
        this.reaction({
            title: 'React: Travis Moone',
            grifter: true,
            cost: [ability.costs.bootSelf()],
            message: context =>
                this.game.addMessage('{0} uses {1} to shuffle their hand into their draw deck and draw a new hand', context.player, this),
            handler: context => {
                context.player.hand.forEach(card => {
                    context.player.moveCardWithContext(card, 'draw deck', context);
                });       
                context.player.shuffleDrawDeck();
                context.player.drawCardsToHand(context.player.handSize, context);
            }
        });
    }
}

TravisMoone.code = '01049';

module.exports = TravisMoone;
