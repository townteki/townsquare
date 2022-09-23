const GameAction = require('./GameAction');

class RemoveFromGame extends GameAction {
    constructor() {
        super('removeFromGame');
    }

    canChangeGameState({ card }) {
        return card.location !== 'out of game';
    }

    createEvent({ card, player }) {
        player = player || card.controller;
        return this.event('onCardRemovedFromGame', { player, card }, event => {
            event.cardStateWhenRemoved = event.card.createSnapshot();
            event.player.moveCard(event.card, 'out of game', {});
        });
    }
}

module.exports = new RemoveFromGame();
