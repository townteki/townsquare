const DeedCard = require('../../deedcard.js');

class BiltonCollectionAgency extends DeedCard {
    setupCardAbilities(ability) {
        this.reaction({
            title: 'Collect Extra Production',
            when: {
                onProductionReceived: event =>
                    event.player === this.player
            },
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose a deed you control but do not own',
                waitingPromptTitle: 'Waiting for opponent to choose a deed',
                cardCondition: {location: 'play area', controller: 'current', condition: card => card.owner !== this.controller},
                cardType: ['deed']
            },
            handler: context => {
                this.controller.modifyGhostRock(context.target.production);
                this.game.addMessage('{0} uses {1} to gain {2} ghost rock from {3}', this.controller, this, context.target.production, context.target);
            }
        });
    }
}

BiltonCollectionAgency.code = '19027';

module.exports = BiltonCollectionAgency;
