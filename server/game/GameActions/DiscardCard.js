const GameAction = require('./GameAction');

class DiscardCard extends GameAction {
    constructor() {
        super('discard');
    }

    canChangeGameState({ card }) {
        return ['draw deck', 'hand', 'play area', 'draw hand'].includes(card.location);
    }

    createEvent({ card, allowSave = true, source }) {
        let params = {
            card: card,
            allowSave: allowSave,
            originalLocation: card.location,
            source: source
        };
        return this.event('onCardDiscarded', params, event => {
            event.cardStateWhenDiscarded = event.card.createSnapshot();
            event.card.controller.moveCard(event.card, 'discard pile');
        });
    }
}

module.exports = new DiscardCard();
