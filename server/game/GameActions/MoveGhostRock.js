const GameAction = require('./GameAction');

class MoveGhostRock extends GameAction {
    constructor() {
        super('moveGhostRock');
    }

    canChangeGameState({ from, to, amount = 1 }) {
        return (
            amount > 0 &&
            from.ghostrock > 0 &&
            ['play area'].includes(from.location) &&
            ['play area'].includes(to.location)
        );
    }

    createEvent({ from, to, amount = 1 }) {
        let appliedGR = Math.min(from.ghostrock, amount);
        return this.event('onCardGhostRockMoved', { source: from, target: to, ghostrock: appliedGR }, event => {
            event.source.modifyGhostRock(-appliedGR);
            event.target.modifyGhostRock(appliedGR);
        });
    }
}

module.exports = new MoveGhostRock();
