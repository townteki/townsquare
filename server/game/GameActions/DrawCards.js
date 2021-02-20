const _ = require('underscore');
const GameAction = require('./GameAction');
const TextHelper = require('../TextHelper');

class DrawCards extends GameAction {
    constructor() {
        super('drawCards');
    }

    message({ player, amount }) {
        const actualAmount = player.getNumCardsToDraw(amount);
        return {
            format: 'draw {cards}',
            args: {
                cards: TextHelper.count(actualAmount, 'card')
            }
        };
    }

    canChangeGameState({ player, amount }) {
        return amount > 0 && player.getNumCardsToDraw(amount) > 0;
    }

    createEvent({ player, amount, reason = 'ability', source, target = 'hand' }) {
        const actualAmount = player.getNumCardsToDraw(amount);
        const eventProps = {
            amount: actualAmount,
            cards: [],
            desiredAmount: amount,
            length: actualAmount, // Needed for legacy reason
            player,
            reason,
            source,
            target
        };
        return this.event('onCardsDrawn', eventProps, event => {
            let remainder = 0;
            let cards = player.drawDeck.slice(0, event.amount);
            if(event.amount < event.desiredAmount) {
                remainder = event.desiredAmount - event.amount;
            }

            for(const card of cards) {
                event.thenAttachEvent(
                    this.event('onCardDrawn', { card, player: event.player, reason, source, target }, () => {
                        player.placeCardInPile({ card, location: target });
                        player.drawnCards += 1;
                    })
                );
            }

            if(remainder > 0) {
                player.shuffleDiscardToDrawDeck();
                let remainingCards = player.drawDeck.slice(0, remainder);
                for(const card of remainingCards) {
                    event.thenAttachEvent(
                        this.event('onCardDrawn', { card, player: event.player, reason, source, target }, () => {
                            player.placeCardInPile({ card, location: target });
                            player.drawnCards += 1;
                        })
                    );
                }
                cards = _.union(cards, remainingCards);      
            }
       
            event.cards = cards;
        });
    }
}

module.exports = new DrawCards();
