const GameAction = require('./GameAction');

class DiscardCard extends GameAction {
    constructor() {
        super('discard');
    }

    canChangeGameState({ card }) {
        return ['draw deck', 'hand', 'play area', 'draw hand', 'being played'].includes(card.location);
    }

    createEvent({ card, options = { isCardEffect: true }, context }) {
        let params = {
            card: card,
            originalLocation: card.location,
            originalGameLocation: card.gamelocation,
            isCardEffect: options.isCardEffect,
            isCasualty: options.isCasualty,
            isUpkeep: options.isUpkeep
        };
        if(context) {
            params.isFromOpponent = context.player !== card.controller;
        }
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
