const GameAction = require('./GameAction');

class AceCard extends GameAction {
    constructor() {
        super('ace');
    }

    canChangeGameState({ card }) {
        return ['draw deck', 'hand', 'play area', 'draw hand', 'discard pile', 'being played'].includes(card.location);
    }

    createEvent({ card, allowSave = true, options = { isCardEffect: true }, context }) {
        let params = {
            card: card,
            allowSave: allowSave,
            originalLocation: card.location,
            isCardEffect: options.isCardEffect,
            isCasualty: options.isCasualty
        };
        if(context) {
            params.isFromOpponent = context.player !== card.controller;
        }
        return this.event('onCardAced', params, event => {
            if(event.originalLocation === 'play area' && event.card.bounty) {
                if((event.isCardEffect && event.isFromOpponent) || event.isCasualty) {
                    event.card.collectBounty(event.card.controller.getOpponent());
                }
            }
            event.cardStateWhenAced = event.card.createSnapshot();
            event.card.controller.moveCard(event.card, 'dead pile');
        });
    }
}

module.exports = new AceCard();
