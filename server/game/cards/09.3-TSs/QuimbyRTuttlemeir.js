const DudeCard = require('../../dudecard.js');

class QuimbyRTuttlemeir extends DudeCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Quimby R. Tuttlemeir',
            playType: ['noon'],
            cost: ability.costs.ace(card =>
                (card.location === 'play area') &&
                card.hasKeyword('abomination') &&
                (card.influence >= 1) &&
                card.owner.equals(this.controller) &&
                card.controller.equals(this.controller) &&
                card.isNearby(this.gamelocation) ),
            message: context => this.game.addMessage('{0} has {1} devour {2} for permanent +1 influence',
                context.player, this, context.costs.ace),
            handler: () => this.modifyInfluence(1)
        });
    }
}

QuimbyRTuttlemeir.code = '17005';

module.exports = QuimbyRTuttlemeir;
