const GameAction = require('./GameAction');

class DiscardCard extends GameAction {
    constructor() {
        super('discard');
    }

    canChangeGameState({ card }) {
        return ['draw deck', 'hand', 'play area', 'draw hand'].includes(card.location);
    }

    createEvent({ card, allowSave = true, options = { isCardEffect: true, isFromOpponent: true } }) {
        let params = {
            card: card,
            allowSave: allowSave,
            originalLocation: card.location,
            originalGameLocation: card.gamelocation,
            isCardEffect: options.isCardEffect,
            isFromOpponent: options.isFromOpponent,
            isCasualty: options.isCasualty
        };
        return this.event('onCardDiscarded', params, event => {
            if(event.originalLocation === 'play area' && event.card.bounty) {
                if((event.isCardEffect && event.isFromOpponent) || event.isCasualty) {
                    event.card.collectBounty(event.card.controller.getOpponent());
                }
            }
            event.cardStateWhenDiscarded = event.card.createSnapshot();
            event.card.controller.moveCard(event.card, 'discard pile');
        });
    }
}

module.exports = new DiscardCard();
