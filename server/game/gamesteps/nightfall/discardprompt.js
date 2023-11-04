const PlayerOrderPrompt = require('../playerorderprompt.js');

class DiscardPrompt extends PlayerOrderPrompt {
    continue() {
        if(!this.isComplete()) {
            if(this.currentPlayer.discardAllDuringNightfall()) {
                if(this.currentPlayer.hand.length) {
                    this.game.addMessage('{0} discards {1} as part of Nightfall', this.currentPlayer, this.currentPlayer.hand);
                    this.currentPlayer.discardCards(this.currentPlayer.hand);
                } else {
                    this.noDiscard(this.currentPlayer);
                }
                this.completePlayer();
            } else {
                if(this.game.isSolo() && this.currentPlayer.equals(this.game.automaton)) {
                    this.handleSolo();
                } else {
                    const discardNum = this.currentPlayer.getNumberOfDiscardsAtNightfall();
                    if(discardNum > 0) {
                        this.game.promptForSelect(this.currentPlayer, {
                            activePromptTitle: `Select up to ${discardNum} cards from hand to discard`,
                            cardCondition: card => card.location === 'hand' &&
                            card.controller.equals(this.currentPlayer),
                            multiSelect: true,
                            numCards: discardNum,
                            onSelect: (player, cards) => {
                                this.discardCards(player, cards);
                                return true;
                            },
                            onCancel: player => this.noDiscard(player)
                        });
                    } else {
                        this.noDiscard(this.currentPlayer);
                    }
                }
            }
        }

        return this.isComplete(); 
    }

    handleSolo() {
        const cardsToDiscard = this.game.automaton.getCardsToDiscardOnNightfall();
        this.discardCards(this.game.automaton, cardsToDiscard);
    }

    discardCards(player, cards) {
        player.discardCards(cards);
        this.game.addMessage('{0} discards {1} as part of Nightfall', player, cards);
        this.completePlayer();
    }

    noDiscard(player) {
        this.game.queueSimpleStep(() => this.game.addMessage('{0} does not discard any card as part of Nightfall', player));
        this.completePlayer();
    }
}

module.exports = DiscardPrompt;
