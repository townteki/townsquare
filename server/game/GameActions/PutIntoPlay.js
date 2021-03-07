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
        return this.event('onCardPutIntoPlay', this.getDefaultParams(player, card, params), event => {
            event.player.putIntoPlay(event.card, { 
                playingType: event.playingType, 
                target: event.target, 
                targetParent: event.targetParent,
                context: event.context, 
                force: event.force });
        });
    }

    getDefaultParams(player, card, params) {
        return {
            player,
            card,
            target: params.target || '',
            targetParent: params.targetParent,
            playingType: params.playingType || 'play',
            context: params.context || {}
        };
    }
}

module.exports = new PutIntoPlay();
