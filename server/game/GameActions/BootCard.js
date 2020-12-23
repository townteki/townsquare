const GameAction = require('./GameAction');

class BootCard extends GameAction {
    constructor() {
        super('boot');
    }

    canChangeGameState({ card }) {
        return ['outfit', 'play area'].includes(card.location) && !card.booted;
    }

    createEvent({ card, playType }) {
        return this.event('onCardBooted', { card, playType }, event => {
            event.card.booted = true;
        });
    }
}

module.exports = new BootCard();
