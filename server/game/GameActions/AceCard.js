const GameAction = require('./GameAction');

class AceCard extends GameAction {
    constructor() {
        super('ace');
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
        return this.event('onCardAced', params, event => {
            event.cardStateWhenAced = event.card.createSnapshot();
            event.card.controller.moveCard(event.card, 'dead pile');
        });
    }
}

module.exports = new AceCard();
