const GameAction = require('./GameAction');

class PutIntoPlay extends GameAction {
    constructor() {
        super('putIntoPlay');
    }

    canChangeGameState({ player, card }) {
        player = player || card.controller;
        return card.location !== 'play area' &&
            player.canPutIntoPlay(card);
    }

    createEvent({ player, card, params = {} }) {
        player = player || card.controller;
        return this.event('onCardPutIntoPlay', { player, card, options: this.getDefaultParams(params) }, event => {
            event.player.putIntoPlay(event.card, event.options);
        });
    }

    getDefaultParams(params) {
        const defaultParams = {
            target: params.target || '',
            playingType: params.playType || 'play',
            context: params.context || {}
        };
        return Object.assign(params, defaultParams);
    }
}

module.exports = new PutIntoPlay();
