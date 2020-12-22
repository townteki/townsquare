const GameAction = require('./GameAction');

class MoveDude extends GameAction {
    constructor() {
        super('moveDude');
    }

    canChangeGameState({ card }) {
        return (
            card.getType() === 'dude' &&
            ['outfit', 'play area'].includes(card.location)
        );
    }

    createEvent({ card, targetUuid, options = {} }) {
        return this.event('onDudeMoved', { card, target: targetUuid, options: options }, event => {
            event.card.controller.moveDude(event.card, event.target, event.options);
        });
    }
}

module.exports = new MoveDude();
