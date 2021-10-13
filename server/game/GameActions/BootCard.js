const GameAction = require('./GameAction');

class BootCard extends GameAction {
    constructor() {
        super('boot');
    }

    canChangeGameState({ card }) {
        return ['outfit', 'play area'].includes(card.location) && !card.booted;
    }

    createEvent({ card, context }) {
        return this.event('onCardBooted', { card, context }, event => {
            event.card.booted = true;
        });
    }
}

module.exports = new BootCard();
