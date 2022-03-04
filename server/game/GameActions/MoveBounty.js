const GameActions = require('.');
const GameAction = require('./GameAction');

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

    createEvent({ from, to, amount = 1, context }) {
        let appliedBounty = Math.min(from.bounty, amount);
        return this.event('onCardBountyMoved', { source: from, target: to, bounty: appliedBounty }, event => {
            event.source.game.resolveGameAction(GameActions.removeBounty({ 
                card: event.source,
                amount: event.bounty
            }), context);
            event.target.game.resolveGameAction(GameActions.addBounty({ 
                card: event.target,
                amount: event.bounty
            }), context);
        });
    }
}

module.exports = new MoveBounty();
