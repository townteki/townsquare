const GameAction = require('./GameAction');

class RemoveBounty extends GameAction {
    constructor() {
        super('removeBounty');
    }

    canChangeGameState({ card }) {
        return ['play area'].includes(card.location) && card.bounty > 0;
    }

    createEvent({ card, options = { removeAll: false, amount: 1 } }) {
        if(options.removeAll) {
            options.amount = 999;
        }
        return this.event('onCardBountyRemoved', { card, bounty: options.amount }, event => {
            event.card.decreaseBounty(event.bounty);
        });
    }
}

module.exports = new RemoveBounty();
