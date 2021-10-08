const GameAction = require('./GameAction');

class IncreaseCasualties extends GameAction {
    constructor() {
        super('increaseCasualties');
    }

    canChangeGameState({ player }) {
        return !!player.game.shootout;
    }

    createEvent({ player, amount = 1 }) {
        return this.event('onPlayerCasualtiesIncreased', { player, amount }, event => {
            event.player.modifyCasualties(event.amount);
        });
    }
}

module.exports = new IncreaseCasualties();
