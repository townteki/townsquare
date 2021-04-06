const GameAction = require('./GameAction');

class SendHome extends GameAction {
    constructor() {
        super('sendHome');
    }

    canChangeGameState({ card, options = {}, context }) {
        return (
            card.getType() === 'dude' &&
            ['outfit', 'play area'].includes(card.location) &&
            (options.isAfterJob || card.isAtHome() || (card.allowGameAction('moveDude', context))) &&
            (options.isAfterJob || !options.needToBoot || card.allowGameAction('boot', context)) &&
            (!options.fromPosse || card.allowGameAction('removeFromPosse', context))
        );
    }

    createEvent({ card, options = {} }) {
        let params = this.getDefaultOptions(options);
        return this.event('onDudeSentHome', { card, options: params }, event => {
            if(options.fromPosse) {
                event.card.game.shootout.removeFromPosse(card);
            } 
            event.card.sendHome(event.options);
        });
    }

    getDefaultOptions(options) {
        return {
            isCardEffect: options.isCardEffect || options.isCardEffect === false ? options.isCardEffect : true,
            moveType: 'toHome',
            needToBoot: options.needToBoot || options.needToBoot === false ? options.needToBoot : true,
            allowBooted: options.allowBooted || options.allowBooted === false ? options.allowBooted : true,
            fromPosse: options.fromPosse || options.fromPosse === false ? options.fromPosse : true
        };
    }
}

module.exports = new SendHome();
