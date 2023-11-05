const { BountyType } = require('../Constants');
const GameAction = require('./GameAction');

class AddBounty extends GameAction {
    constructor() {
        super('addBounty');
    }

    canChangeGameState({ card }) {
        return ['play area'].includes(card.location) && card.getType() === 'dude';
    }

    createEvent({ card, amount = 1, maxAmount = 999, reason = BountyType.default }) {
        return this.event('onCardBountyAdded', { card, bounty: amount, maxAmount, reason }, event => {
            event.card.increaseBounty(event.bounty, event.maxAmount);
        });
    }
}

module.exports = new AddBounty();
