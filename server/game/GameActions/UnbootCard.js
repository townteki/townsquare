const GameAction = require('./GameAction');

class UnbootCard extends GameAction {
    constructor() {
        super('unboot');
    }

    canChangeGameState({ card }) {
        return ['outfit', 'play area'].includes(card.location) && card.booted;
    }

    createEvent({ card }) {
        return this.event('onCardUnbooted', { card }, event => {
            event.card.booted = false;
        });
    }
}

module.exports = new UnbootCard();
