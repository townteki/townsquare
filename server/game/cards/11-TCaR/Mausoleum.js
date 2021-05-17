const DeedCard = require('../../deedcard.js');

class Mausoleum extends DeedCard {
    setupCardAbilities(ability) {
        this.reaction({
            title: 'Mausoleum',
            costs: ability.costs.bootSelf(),
            when: {
                onCardAced: event =>
                    !event.card.hasOneOfKeywords(['token', 'abomination']) && event.card.getType() === 'dude'
            },
            message: context => this.game.addMessage('{0} uses {1} to have {1} gain a permanent CP', context.player, this),
            handler: () => {
                this.modifyControl(1);
            }
        });
    }
}

Mausoleum.code = '19021';

module.exports = Mausoleum;
