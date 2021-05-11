const BaseStep = require('../basestep');

class DiscardToHandSizePrompt extends BaseStep {
    constructor(game) {
        super(game);
        this.players = this.game.getPlayersInFirstPlayerOrder();
    }

    continue() {
        while(this.players.length) {
            let currentPlayer = this.players.shift();
            if(currentPlayer.isOverHandsizeLimit()) {
                this.promptPlayerToDiscard(currentPlayer);
                return false;
            }
        }
        this.game.raiseEvent('onHandsizeLimitChecked');
    }

    promptPlayerToDiscard(currentPlayer) {
        let overHandsize = currentPlayer.hand.length - currentPlayer.handSize;
        let cardOrCards = overHandsize === 1 ? 'card' : 'cards';
        this.game.promptForSelect(currentPlayer, {
            ordered: true,
            mode: 'exactly',
            numCards: overHandsize,
            activePromptTitle: `Select ${overHandsize} ${cardOrCards} to discard down to hand size (top first)`,
            waitingPromptTitle: 'Waiting for opponent to discard down to hand size',
            cardCondition: card => card.location === 'hand' && card.controller === currentPlayer,
            onSelect: (player, cards) => this.discardCards(player, cards),
            onCancel: (player) => this.cancelSelection(player)
        });
    }

    discardCards(player, cards) {
        // Reverse the order selection so that the first card selected ends up
        // on the top of the discard pile.
        cards = cards.reverse();
        player.discardCards(cards, false, () => {
            this.game.addMessage('{0} discards {1} to meet hand size limit', player, cards);
        });
        return true;
    }

    cancelSelection(player) {
        this.game.addAlert('danger', '{0} continues without discarding down to hand size', player, this);
        return true;
    }
}

module.exports = DiscardToHandSizePrompt;
