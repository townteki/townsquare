const GameAction = require('./GameAction');

class PlaceToken extends GameAction {
    constructor() {
        super('placeToken');
    }

    canChangeGameState({ card, amount = 1 }) {
        return card.location === 'play area' && amount > 0;
    }

    createEvent({ card, token, amount = 1 }) {
        return this.event('onTokenPlaced', { card, token, amount }, event => {
            event.card.modifyToken(event.token, event.amount);
        });
    }
}

module.exports = new PlaceToken();
