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
        return amount > 0 && (player.getNumCardsToDraw(amount) > 0 || player.discardPile.length > 0);
    }

    createEvent({ player, amount, reason = 'ability', source, target = 'hand' }) {
        const eventProps = {
            amount,
            cards: [],
            player,
            reason,
            source,
            target
        };

        return this.event('onCardsDrawn', eventProps, event => {
            event.cards = event.player.drawDeckAction(event.amount, card => 
                player.placeCardInPile({ card, location: event.target }));
        });
    }
}

module.exports = new DrawCards();
