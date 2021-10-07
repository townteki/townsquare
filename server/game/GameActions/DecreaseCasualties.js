const GameAction = require('./GameAction');

class DecreaseCasualties extends GameAction {
    constructor() {
        super('decreaseCasualties');
    }

    canChangeGameState({ player }) {
        return !!player.game.shootout;
    }

    createEvent({ player, amount = 999 }) {
        return this.event('onPlayerCasualtiesDecreased', { player, amount }, event => {
            event.player.modifyCasualties(-event.amount);
        });
    }
}

module.exports = new DecreaseCasualties();
