const GameAction = require('./GameAction');

class IncreaseCasualties extends GameAction {
    constructor() {
        super('increaseCasualties');
    }

    canChangeGameState({ player, context }) {
        return !!player.game.shootout &&
            !player.cannotIncreaseCasualties(context);
    }

    createEvent({ player, amount = 1, context }) {
        return this.event('onPlayerCasualtiesIncreased', { player, amount, context }, event => {
            event.player.modifyCasualties(event.amount);
        });
    }
}

module.exports = new IncreaseCasualties();
