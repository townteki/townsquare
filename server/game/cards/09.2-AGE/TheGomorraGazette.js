const DeedCard = require('../../deedcard.js');

class TheGomorraGazette extends DeedCard {
    setupCardAbilities(ability) {
        this.reaction({
            title: 'Gain Ghost Rock',
            when: {
                onCardBountyAdded: event =>
                    event.card.controller !== this.controller
            },
            cost: ability.costs.bootSelf(),
            handler: context => {
                this.controller.modifyGhostRock(context.event.card.influence);
                this.game.addMessage('{0} uses {1} to gain {2} ghost rock from {3}', context.player, this, context.event.card.influence, context.event.card);
            }
        });
    }
}

TheGomorraGazette.code = '16011';

module.exports = TheGomorraGazette;
