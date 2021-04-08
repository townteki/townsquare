const GameAction = require('./GameAction');

class BootCard extends GameAction {
    constructor() {
        super('boot');
    }

    canChangeGameState({ card }) {
        return ['outfit', 'play area'].includes(card.location) && !card.booted;
    }

    createEvent({ card }) {
        return this.event('onCardBooted', { card }, event => {
            event.card.booted = true;
        });
    }
}

module.exports = new BootCard();
