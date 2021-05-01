const DudeCard = require('../../dudecard.js');

class TravisMoone extends DudeCard {
    setupCardAbilities(ability) {
        this.reaction({
            title: 'React: Travis Moone',
            when: {
                onSetupFinished: () => this.controller.availableGrifterActions > 0
            },
            cost: [ability.costs.bootSelf()],
            message: context =>
                this.game.addMessage('{0} uses {1} to shuffle hand to draw deck and draw a new hand', context.player, this),
            handler: context => {
                context.player.hand.forEach(card => {
                    context.player.moveCard(card, 'draw deck');
                });       
                context.player.shuffleDrawDeck();
                context.player.drawCardsToHand(context.player.handSize, context);
            }
        });
    }
}

TravisMoone.code = '01049';

module.exports = TravisMoone;
