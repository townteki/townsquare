const GameAction = require('./GameAction');

class RemoveFromPosse extends GameAction {
    constructor() {
        super('removeFromPosse');
    }

    canChangeGameState({ card, context }) {
        return (
            card.game.shootout &&
            card.getType() === 'dude' &&
            ['outfit', 'play area'].includes(card.location) &&
            card.allowGameAction('removeFromPosse', context)
        );
    }

    createEvent({ card, context }) {
        return this.event('onDudeLeftPosse', { card, shootout: card.game.shootout, context }, event => {
            event.shootout.removeFromPosse(event.card);
        });
    }
}

module.exports = new RemoveFromPosse();
