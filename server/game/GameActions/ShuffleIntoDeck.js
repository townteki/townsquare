const GameAction = require('./GameAction');
const Shuffle = require('./Shuffle');

class ShuffleIntoDeck extends GameAction {
    constructor() {
        super('shuffleIntoDeck');
    }

    canChangeGameState({ cards }) {
        return this.makeCardArray(cards).some(card => card.location !== 'draw deck');
    }

    createEvent({ cards }) {
        return this.event('onCardsShuffledIntoDeck', { cards: this.makeCardArray(cards) }, event => {
            const players = new Set();

            for(const card of event.cards) {
                card.owner.moveCard(card, 'draw deck');
                players.add(card.owner);
            }

            for(const player of players) {
                event.thenAttachEvent(Shuffle.createEvent({ player }));
            }
        });
    }

    makeCardArray(cards) {
        if(!Array.isArray(cards)) {
            return [cards];
        }
        return cards;
    }
}

module.exports = new ShuffleIntoDeck();
