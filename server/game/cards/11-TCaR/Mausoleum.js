const DeedCard = require('../../deedcard.js');

class Mausoleum extends DeedCard {
    setupCardAbilities(ability) {
        this.reaction({
            title: 'Mausoleum',
            cost: ability.costs.bootSelf(),
            when: {
                onCardAced: event =>
                    !event.card.hasOneOfKeywords(['token', 'abomination']) && event.card.getType() === 'dude' && event.originalLocation === 'play area'
            },
            message: context => this.game.addMessage('{0} uses {1} to have it gain a permanent CP', context.player, this),
            handler: () => {
                this.modifyControl(1);
            }
        });
    }
}

Mausoleum.code = '19021';

module.exports = Mausoleum;
