const GameAction = require('./GameAction');

class AddBounty extends GameAction {
    constructor() {
        super('addBounty');
    }

    canChangeGameState({ card }) {
        return ['play area'].includes(card.location) && card.getType() === 'dude';
    }

    createEvent({ card, amount = 1 }) {
        return this.event('onCardBountyAdded', { card, bounty: amount }, event => {
            event.card.increaseBounty(event.bounty);
        });
    }
}

module.exports = new AddBounty();
