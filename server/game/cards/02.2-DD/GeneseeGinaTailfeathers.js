const DudeCard = require('../../dudecard.js');

class GeneseeGinaTailfeathers extends DudeCard {
    setupCardAbilities(ability) {
        this.reaction({
            title: 'React: Genesse Tailfeathers',
            grifter: true,
            cost: [
                ability.costs.bootSelf(),
                ability.costs.discardFromHand()
            ],
            message: context => this.game.addMessage('{0} boots {1} to discard {2} from hand and draw two cards',
                context.player, this, context.costs.discardFromHand),
            handler: context => context.player.drawCardsToHand(2, context)
        });
    }
}

GeneseeGinaTailfeathers.code = '03009';

module.exports = GeneseeGinaTailfeathers;
