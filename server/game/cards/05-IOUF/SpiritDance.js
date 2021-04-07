const GameActions = require('../../GameActions/index.js');
const SpellCard = require('../../spellcard.js');

class SpiritDance extends SpellCard {
    setupCardAbilities(ability) {
        this.spellAction({
            title: 'Spirit Dance',
            playType: 'shootout',
            cost: ability.costs.bootSelf(),
            difficulty: 10,
            onSuccess: (context) => {
                let naturespirit = context.player.placeToken('09042', this.parent.gamelocation);
                this.game.resolveGameAction(GameActions.joinPosse({ card: naturespirit }), context);
                this.game.addMessage('{0} uses {1} to bring a Nature Spirit into their posse', context.player, this);
            }
        });
    }
}

SpiritDance.code = '09032';

module.exports = SpiritDance;
