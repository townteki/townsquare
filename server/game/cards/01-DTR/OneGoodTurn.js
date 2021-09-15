const ActionCard = require('../../actioncard.js');

class OneGoodTurn extends ActionCard {
    setupCardAbilities() {
        this.action({
            title: 'noon: draw a card',
            playType: ['noon'],
            message: context =>
                this.game.addMessage('{0} uses {1} to draw a card', context.player, this),
            handler: context => {
                context.player.drawCardsToHand(1, context);
            }
        });
        this.action({
            title: 'cheatin: gain 3 GR',
            playType: ['cheatin resolution'],
            message: context => 
                this.game.addMessage('{0} uses {1} to gain 3 GR', context.player, this),
            handler: context => {
                context.player.modifyGhostRock(3);
            }
        });
    }
}

OneGoodTurn.code = '01122';

module.exports = OneGoodTurn;
