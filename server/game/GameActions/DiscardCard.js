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
            isCardEffect: options.isCardEffect,
            isFromOpponent: options.isFromOpponent,
            isCasualty: options.isCasualty
        };
        return this.event('onCardDiscarded', params, event => {
            if (event.originalLocation === 'play area' && event.card.bounty) {
                if ((event.isCardEffect && event.isFromOpponent) || event.isCasualty) {
                    let opponent = event.card.controller.getOpponent();
                    opponent.modifyGhostRock(event.card.bounty);
                    event.card.game.addMessage('{0} collects {1} GR bounty for {2}.', opponent, event.card.bounty, event.card);
                }
            }
            event.cardStateWhenDiscarded = event.card.createSnapshot();
            event.card.controller.moveCard(event.card, 'discard pile');
        });
    }
}

module.exports = new DiscardCard();
