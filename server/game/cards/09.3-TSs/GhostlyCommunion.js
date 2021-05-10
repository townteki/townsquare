const GameActions = require('../../GameActions/index.js');
const SpellCard = require('../../spellcard.js');

class GhostlyCommunion extends SpellCard {
    setupCardAbilities(ability) {
        this.spellAction({
            title: 'Noon: Move Dude',
            playType: 'noon',
            cost: ability.costs.bootSelf(),
            difficulty: 5,
            target: {
                activePromptTitle: 'Choose a location to move your dude to',
                waitingPromptTitle: 'Waiting for opponent to choose a location',
                condition: card => card.adjacentLocations().some(spot => spot.hasKeyword('holy ground')),
                cardType: 'location'
            },
            onSuccess: (context) => {
                this.game.resolveGameAction(GameActions.moveDude({
                    card: this.parent,
                    targetUuid: context.target.gamelocation
                }));
            },
            source: this
        });
    }
}

GhostlyCommunion.code = '17017';

module.exports = GhostlyCommunion;
