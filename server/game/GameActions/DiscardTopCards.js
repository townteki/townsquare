const GameAction = require('./GameAction');
const DiscardCard = require('./DiscardCard');

class DiscardTopCards extends GameAction {
    constructor() {
        super('discardTopCards');
    }

    canChangeGameState({ player, amount }) {
        return amount > 0 && player.drawDeck.length > 0;
    }

    createEvent({ player, amount }) {
        let params = {
            amount,
            player,
            topCards: []
        };
        return this.event('onTopCardsDiscarded', params, event => {
            event.topCards = event.player.drawDeckAction(event.amount, card => {
                event.thenAttachEvent(
                    DiscardCard.createEvent({ card })
                );                
            });
        });
    }
}

module.exports = new DiscardTopCards();
