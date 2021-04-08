const GameAction = require('./GameAction');

class MoveDude extends GameAction {
    constructor() {
        super('moveDude');
    }

    canChangeGameState({ card, targetUuid, options = {}, context }) {
        let params = this.getDefaultOptions(options);
        return (
            card.getType() === 'dude' &&
            card.gamelocation !== targetUuid &&
            ['outfit', 'play area'].includes(card.location) &&
            card.allowGameAction('moveDude', context) &&
            (!params.needToBoot || card.allowGameAction('boot', context) || 
            (params.toPosse && card.canJoinWithoutBooting()))
        );
    }

    createEvent({ card, targetUuid, options = {}, context }) {
        let params = this.getDefaultOptions(options);
        params.context = context;
        return this.event('onDudeMoved', { card, target: targetUuid, options: params }, event => {
            event.card.controller.moveDude(event.card, event.target, event.options);
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
}

module.exports = new MoveDude();
