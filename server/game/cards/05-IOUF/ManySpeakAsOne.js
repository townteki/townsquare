const SpellCard = require('../../spellcard.js');

class ManySpeakAsOne extends SpellCard {
    setupCardAbilities(ability) {
        this.spellAction({
            title: 'Many Speak as One',
            playType: 'noon',
            cost: ability.costs.bootSelf(),
            difficulty: 9,
            onSuccess: (context) => {
                let ancestorspirit = context.player.placeToken('ancestor spirit', this.parent.gamelocation);
                this.game.addMessage('{0} uses {1} to bring a {2} into the {3}', context.player, this, ancestorspirit, this.parent.locationCard);
            }
        });
    }
}

ManySpeakAsOne.code = '09034';

module.exports = ManySpeakAsOne;
