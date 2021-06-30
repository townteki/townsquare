const GameAction = require('./GameAction');
const RemoveFromPosse = require('./RemoveFromPosse');

class MoveDude extends GameAction {
    constructor() {
        super('moveDude');
    }

    canChangeGameState({ card, targetUuid, options = {}, context }) {
        let params = this.getDefaultOptions(options);
        return (
            card && card.getType() === 'dude' &&
            card.gamelocation !== targetUuid &&
            ['outfit', 'play area'].includes(card.location) &&
            card.allowGameAction('moveDude', context) &&
            (!params.needToBoot || card.allowGameAction('boot', context) || 
            (params.toPosse && card.canJoinWithoutBooting())) &&
            (!card.game.shootout || this.canLeaveShootout(card))
        );
    }

    createEvent({ card, targetUuid, options = {}, context }) {
        let params = this.getDefaultOptions(options);
        params.originalLocation = card.gamelocation;
        params.context = context;
        return this.event('onDudeMoved', { card, target: targetUuid, options: params }, event => {
            event.card.controller.moveDude(event.card, event.target, event.options);
            if(event.card.game.shootout && event.card.isParticipating() && 
                event.options.originalLocation === event.card.game.shootout.shootoutLocation.uuid) {
                event.thenAttachEvent(RemoveFromPosse.createEvent({ card: event.card, context: event.options.context }));
            }
        });
    }

    getDefaultOptions(options = {}) {
        const defaultOptions = {
            isCardEffect: options.isCardEffect || options.isCardEffect === false ? options.isCardEffect : true,
            moveType: options.moveType || 'default',
            needToBoot: options.needToBoot || options.needToBoot === false ? options.needToBoot : false,
            allowBooted: options.allowBooted || options.allowBooted === false ? options.allowBooted : true
        };
        if(defaultOptions.isCardEffect) {
            return Object.assign(options, defaultOptions);
        }
        return options;
    }

    canLeaveShootout(card, context) {
        if(!card.isParticipating()) {
            return true;
        }
        return card.allowGameAction('removeFromPosse', context);
    }
}

module.exports = new MoveDude();
