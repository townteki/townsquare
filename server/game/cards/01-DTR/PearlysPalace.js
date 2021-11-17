const DeedCard = require('../../deedcard.js');

class PearlysPalace extends DeedCard {
    setupCardAbilities(ability) {
        this.reaction({
            title: 'React: Pearly\'s Palace',
            when: {
                onPlayWindowOpened: event => event.playWindow.name === 'shootout plays'
            },
            cost: ability.costs.bootSelf(),
            message: context =>
                this.game.addMessage('{0} uses {1} to make a shootout play before any other player', context.player, this),
            handler: (context) => {
                context.event.playWindow.makePlayOutOfOrder(context.player, this, { title: 'Make shootout play' });
            }
        });
    }
}

PearlysPalace.code = '01064';

module.exports = PearlysPalace;
