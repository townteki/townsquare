const DudeCard = require('../../dudecard.js');

class Alonzo extends DudeCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Draw a card',
            playType: ['noon'],
            cost: ability.costs.discardFromPlay(card => 
                card.parent === this && card.isHex()),
            message: context => 
                this.game.addMessage('{0} uses {1} and discards {2} to draw a card', 
                    context.player, this, context.costs.discardFromPlay),
            handler: context => {
                context.player.drawCardsToHand(1, context);
            }
        });
    }   
}

Alonzo.code = '25011';

module.exports = Alonzo;
