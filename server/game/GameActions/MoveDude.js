const GameAction = require('./GameAction');

class MoveDude extends GameAction {
    constructor() {
        super('moveDude');
    }

    canChangeGameState({ card, targetUuid, options, context }) {
        return (
            card.getType() === 'dude' &&
            card.gamelocation !== targetUuid &&
            ['outfit', 'play area'].includes(card.location) &&
            card.allowGameAction('moveDude', context) &&
            (!options.needToBoot || card.allowGameAction('boot', context) || 
            (options.toPosse && card.canJoinWithoutBooting()))
        );
    }

    createEvent({ card, targetUuid, options = {} }) {
        return this.event('onDudeMoved', { card, target: targetUuid, options: options }, event => {
            event.card.controller.moveDude(event.card, event.target, event.options);
        });
    }
}

module.exports = new MoveDude();
