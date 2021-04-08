const GameActions = require('../../GameActions/index.js');
const SpellCard = require('../../spellcard.js');

class GhostlyCommunion extends SpellCard {
    setupCardAbilities(ability) {
        this.spellAction({
            title: 'Noon:',
            playType: 'shootout:join',
            cost: ability.costs.bootSelf(),
            difficulty: 7,
            target: {
                activePromptTitle: 'Select your dude to join',
                cardCondition: { location: 'play area', participating: false },
                cardType: ['dude'],
                gameAction: 'joinPosse'
            },
            onSuccess: (context) => {
            },
            source: this
        });
    }
}

GhostlyCommunion.code = '17017';

module.exports = GhostlyCommunion;
