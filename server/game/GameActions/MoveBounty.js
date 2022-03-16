const AddBounty = require('./AddBounty');
const GameAction = require('./GameAction');
const RemoveBounty = require('./RemoveBounty');

class MoveBounty extends GameAction {
    constructor() {
        super('moveBounty');
    }

    canChangeGameState({ from, to, amount = 1 }) {
        return (
            amount > 0 &&
            from.bounty > 0 &&
            ['play area'].includes(from.location) &&
            ['play area'].includes(to.location)
        );
    }

    createEvent({ from, to, amount = 1 }) {
        let appliedBounty = Math.min(from.bounty, amount);
        return this.event('onCardBountyMoved', { source: from, target: to, bounty: appliedBounty }, event => {
            event.thenAttachEvent(RemoveBounty.createEvent({ 
                card: event.source,
                amount: event.bounty
            }));
            event.thenAttachEvent(AddBounty.createEvent({ 
                card: event.target,
                amount: event.bounty
            }));
        });
    }
}

module.exports = new MoveBounty();
