const DeedCard = require('../../deedcard.js');
const GameActions = require('../../GameActions/index.js');

class RhamsReadings extends DeedCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Rham\'s Readings',
            playType: ['noon'],
            condition: () => this.controller.getOpponent().drawDeck.length > 0,                
            cost: ability.costs.bootSelf(),
            handler: context => {
                const opponent = context.player.getOpponent();
                let topCard = opponent.drawDeck[0];
                if(topCard.getType() === 'joker') {
                    let jokercard = topCard;
                    this.game.resolveGameAction(GameActions.aceCard({ card: topCard }), context).thenExecute(() => {
                        if(opponent.drawDeck.length > 0) {
                            topCard = opponent.drawDeck[0];
                            this.game.addMessage('{0} uses {1} to reveal {2} which is aced and {3} is revealed as the top card of {4}\'s deck instead', 
                                context.player, this, jokercard, topCard, opponent);
                        } else {
                            this.game.addMessage('{0} uses {1} to reveal {2} which is aced but there are no more cards in {3}\'s draw deck to reveal', 
                                context.player, this, jokercard, opponent);
                        }
                    });
                } else {
                    const topDiscard = opponent.discardPile.length > 0 ? opponent.discardPile[0] : null;
                    if(topDiscard && topDiscard.getType() !== 'joker' && (topCard.suit.toLowerCase() === topDiscard.suit.toLowerCase() || topCard.value === topDiscard.value)) {
                        context.player.modifyGhostRock(1);
                        this.game.addMessage('{0} uses {1} to reveal {2} as the top card of {3}\'s deck, and gains 1 GR', 
                            context.player, this, topCard, opponent);   
                    } else {
                        this.game.addMessage('{0} uses {1} to reveal {2} as the top card of {3}\'s deck, but does not gain any GR', 
                            context.player, this, topCard, opponent);                    
                    }
                }
            }
        });
    }
}

RhamsReadings.code = '22035';

module.exports = RhamsReadings;
