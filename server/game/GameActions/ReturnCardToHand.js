const GameAction = require('./GameAction');

class ReturnCardToHand extends GameAction {
    constructor() {
        super('returnToHand');
    }

    canChangeGameState({ card }) {
        return ['dead pile', 'discard pile', 'play area'].includes(card.location);
    }

    createEvent({ card }) {
        let params = {
            card: card
        };
        return this.event('onCardReturnedToHand', params, event => {
            event.cardStateWhenReturned = card.createSnapshot();
            event.card.controller.moveCard(card, 'hand', {});
        });
    }
}

module.exports = new ReturnCardToHand();
