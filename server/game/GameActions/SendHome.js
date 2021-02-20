const GameAction = require('./GameAction');

class SendHome extends GameAction {
    constructor() {
        super('sendHome');
    }

    canChangeGameState({ card }) {
        return (
            card.getType() === 'dude' &&
            ['outfit', 'play area'].includes(card.location)
        );
    }

    createEvent({ card, options = {} }) {
        let params = this.getDefaultOptions(options);
        return this.event('onDudeMoved', { card, options: params }, event => {
            event.card.sendHome(event.options);
        });
    }

    getDefaultOptions(options) {
        return {
            isCardEffect: options.isCardEffect || options.isCardEffect === false ? options.isCardEffect : true,
            moveType: 'toHome',
            needToBoot: options.needToBoot || options.needToBoot === false ? options.needToBoot : true,
            allowBooted: options.allowBooted || options.allowBooted === false ? options.allowBooted : true
        };
    }
}

module.exports = new SendHome();
