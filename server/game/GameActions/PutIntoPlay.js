const PlayingTypes = require('../Constants/PlayingTypes');
const GameAction = require('./GameAction');

class PutIntoPlay extends GameAction {
    constructor() {
        super('putIntoPlay');
    }

    canChangeGameState({ player, card, params = {} }) {
        player = player || card.controller;
        return card.location !== 'play area' &&
            player.canPutIntoPlay(card, this.getDefaultParams(params));
    }

    createEvent({ player, card, params = {} }) {
        player = player || card.controller;
        return this.event('onCardPutIntoPlay', { player, card, options: this.getDefaultParams(params) }, event => {
            event.player.putIntoPlay(event.card, event.options);
        });
    }

    getDefaultParams(params) {
        const defaultParams = {
            targetLocationUuid: params.targetLocationUuid || '',
            playingType: params.playingType || PlayingTypes.Play,
            context: params.context || {}
        };
        return Object.assign(params, defaultParams);
    }
}

module.exports = new PutIntoPlay();
