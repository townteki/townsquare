const GameAction = require('./GameAction');

class AddBounty extends GameAction {
    constructor() {
        super('addBounty');
    }

    canChangeGameState({ card }) {
        return ['play area'].includes(card.location) && card.getType() === 'dude';
    }

    createEvent({ card, amount = 1, maxAmount = 999 }) {
        return this.event('onCardBountyAdded', { card, bounty: amount, maxAmount }, event => {
            event.card.increaseBounty(event.bounty, event.maxAmount);
        });
    }
}

module.exports = new AddBounty();
