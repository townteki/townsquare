const DudeCard = require('../../dudecard.js');

class PadreErnestodeDiaz extends DudeCard {
    setupCardAbilities(ability) {
        this.reaction({
            when: {
                onDrawHandsRevealed: () => this.controller.getOpponent().isCheatin()
            },
            cost: ability.costs.boot({
                type: 'spell',
                condition: card => card.isMiracle() && card.parent === this
            }),
            message: context =>
                this.game.addMessage('{0} uses {1} to boot {2} and draw a card', context.player, this, context.costs.boot),
            handler: context => {
                context.player.drawCardsToHand(1, context);
            }
        });
    }
}

PadreErnestodeDiaz.code = '20018';

module.exports = PadreErnestodeDiaz;
