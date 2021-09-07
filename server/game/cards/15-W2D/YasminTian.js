const DudeCard = require('../../dudecard.js');

class YasminTian extends DudeCard {
    setupCardAbilities(ability) {
        this.reaction({
            title: 'React: Yasmin Tian',
            grifter: true,
            cost: ability.costs.bootSelf(),
            handler: context => {
                context.player.redrawFromHand(1, (event, discardedCards) => {
                    this.game.addMessage('{0} uses {1} to discard {2} to draw a card', context.player, this, discardedCards[0]);
                }, {
                    title: this.title
                }, context);
            }
        });
    }
}

YasminTian.code = '23001';

module.exports = YasminTian;
