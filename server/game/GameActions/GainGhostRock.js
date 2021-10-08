const GameAction = require('./GameAction');

class GainGhostRock extends GameAction {
    constructor() {
        super('gainGhostRock');
    }

    canChangeGameState({ amount }) {
        return amount > 0;
    }

    createEvent({ player, amount }) {
        return this.event('onGhostRockGained', { player, amount }, event => {
            event.player.modifyGhostRock(event.amount);
        });
    }
}

module.exports = new GainGhostRock();
