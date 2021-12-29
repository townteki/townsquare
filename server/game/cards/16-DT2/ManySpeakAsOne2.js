const SpellCard = require('../../spellcard.js');

class ManySpeakAsOne2 extends SpellCard {
    setupCardAbilities(ability) {
        this.spellAction({
            title: 'Many Speak as One',
            playType: 'noon',
            cost: ability.costs.bootSelf(),
            difficulty: 9,
            onSuccess: (context) => {
                // There is not a new DRAW ancestor spirit yes, so use an old one and set is as draw
                let ancestorspirit = context.player.placeToken('09041', this.parent.gamelocation);
                ancestorspirit.addStudEffect(this.uuid, 'Draw');
                this.game.addMessage('{0} uses {1} to bring a {2} into the {3}', context.player, this, ancestorspirit, this.parent.locationCard);
            }
        });
    }
}

ManySpeakAsOne2.code = '24208';

module.exports = ManySpeakAsOne2;
