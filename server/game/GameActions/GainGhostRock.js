const GameAction = require('./GameAction');

class GainGhostRock extends GameAction {
    constructor() {
        super('gainGhostRock');
    }

    canChangeGameState({ player, amount }) {
        return amount > 0 && player.getGoldToGain(amount) > 0;
    }

    createEvent({ player, amount }) {
        let actualAmount = player.getGoldToGain(amount);
        return this.event('onGhostRockGained', { player, amount: actualAmount, desiredAmount: amount }, event => {
            event.player.gainedGhostRock += event.amount;

            event.player.modifyGold(event.amount);
        });
    }
}

module.exports = new GainGhostRock();
