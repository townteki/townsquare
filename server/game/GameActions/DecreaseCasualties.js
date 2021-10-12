const GameAction = require('./GameAction');

class DecreaseCasualties extends GameAction {
    constructor() {
        super('decreaseCasualties');
    }

    canChangeGameState({ player, context }) {
        return !!player.game.shootout &&
            !player.cannotDecreaseCasualties(context);
    }

    createEvent({ player, amount = 999, context }) {
        return this.event('onPlayerCasualtiesDecreased', { player, amount, context }, event => {
            event.player.modifyCasualties(-event.amount);
        });
    }
}

module.exports = new DecreaseCasualties();
