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
            isCardEffect: options.isCardEffect !== null ? options.isCardEffect : true,
            moveType: 'toHome',
            needToBoot: options.needToBoot !== null ? options.needToBoot : true,
            allowBooted: options.allowBooted !== null ? options.allowBooted : true
        };
    }
}

module.exports = new SendHome();
