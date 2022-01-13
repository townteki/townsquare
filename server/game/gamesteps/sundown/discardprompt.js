const PlayerOrderPrompt = require('../playerorderprompt.js');

class DiscardPrompt extends PlayerOrderPrompt {
    constructor(game) {
        super(game);
        this.selectedCards = [];
    }

    continue() {
        if(!this.isComplete()) {
            const discardNum = this.currentPlayer.getNumberOfDiscardsAtSundown();
            if(discardNum > 0) {
                this.game.promptForSelect(this.currentPlayer, {
                    activePromptTitle: `Select up to ${discardNum} cards from hand to discard`,
                    cardCondition: card => card.location === 'hand' &&
                    card.controller === this.currentPlayer,
                    multiSelect: true,
                    numCards: discardNum,
                    onSelect: (player, cards) => {
                        player.discardCards(cards);
                        this.game.addMessage('{0} discards {1} as part of Sundown', player, cards);
                        this.completePlayer();
                        return true;
                    },
                    onCancel: player => this.noDiscard(player)
                });
            } else {
                this.noDiscard(this.currentPlayer);
            }
        }

        return this.isComplete(); 
    }

    noDiscard(player) {
        this.game.addMessage('{0} does not discard any card as part of Sundown', player);
        this.completePlayer();
    }
}

module.exports = DiscardPrompt;
