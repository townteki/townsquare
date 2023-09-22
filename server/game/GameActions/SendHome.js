const GameAction = require('./GameAction');

class SendHome extends GameAction {
    constructor() {
        super('sendHome');
    }

    canChangeGameState({ card, options = {}, context }) {
        return (
            card && card.getType() === 'dude' &&
            ['outfit', 'play area'].includes(card.location) &&
            (options.isAfterJob || card.isAtHome() || (card.allowGameAction('moveDude', context, options))) &&
            (options.isAfterJob || !options.needToBoot || card.allowGameAction('boot', context, options)) &&
            (!options.fromPosse || card.allowGameAction('removeFromPosse', context, options))
        );
    }

    createEvent({ card, options = {}, context }) {
        let params = this.getDefaultOptions(options);
        params.originalLocation = card.gamelocation;
        return this.event('onDudeSentHome', { card, options: params, context }, event => {
            event.card.sendHome(event.options, context);
        });
    }

    getDefaultOptions(options = {}) {
        const defaultOptions = {
            isCardEffect: options.isCardEffect || options.isCardEffect === false ? options.isCardEffect : true,
            moveType: 'toHome',
            needToBoot: options.needToBoot || options.needToBoot === false ? options.needToBoot : true,
            allowBooted: options.allowBooted || options.allowBooted === false ? options.allowBooted : true,
            fromPosse: options.fromPosse || options.fromPosse === false ? options.fromPosse : true,
            reason: options.reason || 'default'
        };
        return Object.assign(options, defaultOptions);
    }
}

module.exports = new SendHome();
