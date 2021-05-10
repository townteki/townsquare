const DeedCard = require('../../deedcard.js');
const GameActions = require('../../GameActions/index.js');

class BiltonCollectionAgency extends DeedCard {
    setupCardAbilities(ability) {
        this.reaction({
            title: 'Collect Extra Production',
            when: {
                onProductionRecieved: event =>
                    event.player === this.controllingPlayer
            },
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose a deed you control',
                waitingPromptTitle: 'Waiting for opponent to choose a deed',
                cardCondition: {location: 'play area', controller: 'current', condition: card => card.owner !=== this.controllingPlayer},
                cardType: ['deed']
            },
            handler: context => {
                this.controller.modifyGhostRock(context.target.production).thenExecute();
            }


            }
        });
    }
}

BiltonCollectionAgency.code = '19027';

module.exports = BiltonCollectionAgency;