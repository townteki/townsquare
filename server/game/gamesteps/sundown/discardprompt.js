const AllPlayerPrompt = require('../allplayerprompt.js');

class DiscardPrompt extends AllPlayerPrompt {
    constructor(game) {
        super(game);
        this.selectedCards = [];
    }

    completionCondition(player) {
        return player.sundownDiscardDone || player.getNumberOfDiscardsAtSundown() === 0;
    }

    activePrompt(player) {
        return {
            menuTitle: 'Select up to ' + player.getNumberOfDiscardsAtSundown() + ' cards from hand to discard',
            buttons: [
                { arg: 'selected', text: 'Done' }
            ],
            selectCard: true
        };
    }

    waitingPrompt() {
        return { menuTitle: 'Waiting for opponent to discard cards' };
    }

    continue() {
        for(let player of this.game.getPlayers()) {
            if(!this.completionCondition(player)) {
                this.highlightSelectableCards(player);
            }
        }

        return super.continue();
    }

    onCardClicked(player, card) {
        if(card.location !== 'hand') {
            return false;
        }

        if(this.selectedCards.length >= player.getNumberOfDiscardsAtSundown() && !this.selectedCards.includes(card)) {
            return false;
        }

        if(!this.selectedCards.includes(card)) {
            this.selectedCards.push(card);
        } else {
            this.selectedCards = this.selectedCards.filter(selectedCard => selectedCard !== card);
        }
        player.setSelectedCards(this.selectedCards);

    }

    highlightSelectableCards(player) {
        player.selectCard = true;
        player.setSelectableCards(player.hand);
    }

    onMenuCommand(player) {
        player.discardCards(this.selectedCards);
        let selectedText = null;
        if (this.selectedCards.length === 0) {
            this.game.addMessage('{0} does not discard any card as part of Sundown.', player);
        } else if (this.selectedCards.length === 1) {
            selectedText = this.selectedCards[0]
        }

        this.game.addMessage('{0} discards {1} as part of Sundown.', player)
        player.sundownDiscardDone = true;
        this.selectedCards = [];
        player.clearSelectedCards();
        player.clearSelectableCards();
        super.complete(player);
    }

}

module.exports = DiscardPrompt;
