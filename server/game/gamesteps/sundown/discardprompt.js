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
                if(player.discardAllDuringSundown()) {
                    this.discardCards(player, player.hand);
                    super.complete(player);
                } else {
                    this.highlightSelectableCards(player);
                }
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
        this.discardCards(player, this.selectedCards);
        this.selectedCards = [];
        player.clearSelectedCards();
        player.clearSelectableCards();
        super.complete(player);
    }

    discardCards(player, cards) {
        if(cards.length === 0) {
            this.game.addMessage('{0} does not discard any card as part of Sundown', player);
        } else if(cards.length > 0) {
            player.discardCards(cards);            
            this.game.addMessage('{0} discards {1} as part of Sundown', player, cards);
        }
        player.sundownDiscardDone = true;
    }

    handleSolo() {
        const cardsToDiscard = this.game.automaton.getCardsToDiscardOnSundown();
        this.discardCards(this.game.automaton, cardsToDiscard);
        super.complete(this.game.automaton);
    }
}

module.exports = DiscardPrompt;
