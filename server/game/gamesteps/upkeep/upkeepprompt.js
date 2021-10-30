const AllPlayerPrompt = require('../allplayerprompt.js');

class UpkeepPrompt extends AllPlayerPrompt {
    constructor(game) {
        super(game);
        this.title = 'Select Dudes to fire' ;
        this.selectedCards = [];
    }

    completionCondition(player) {
        return player.upkeepPaid;
    }

    activePrompt(player) {
        let upkeep = player.determineUpkeep(this.selectedCards);
        let requiredGR = this.getRequiredUpkeep(player, upkeep);
        let remainingText = requiredGR > 0 ? ` (${requiredGR} GR required)` : '';
        return {
            promptTitle: 'Payday',
            menuTitle: this.title + remainingText,
            buttons: [
                { arg: 'selected', text: 'Done' }
            ],
            selectCard: true
        };
    }

    waitingPrompt() {
        return { menuTitle: 'Waiting for opponent to pay upkeep' };
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
        if(card.controller !== player || card.location !== 'play area' ||
            card.getType() !== 'dude' || card.upkeep === 0) {
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
        player.setSelectableCards(this.getDudesWithUpkeep(player));
    }

    onMenuCommand(player) {
        let upkeep = player.determineUpkeep(this.selectedCards);
        let difference = this.getRequiredUpkeep(player, upkeep);
        if(difference > 0) {
            return false;
        }
        if(this.selectedCards.length) {
            this.discardCards(player, this.selectedCards, () => {
                this.payUpkeepAndComplete(player, upkeep);
            });
        } else {
            this.payUpkeepAndComplete(player, upkeep);
        }
        return true;
    }

    payUpkeepAndComplete(player, upkeep) {
        player.payUpkeep(upkeep);
        this.game.addMessage('{0} has paid upkeep of {1} GR', player, upkeep);
        this.selectedCards = [];
        player.clearSelectedCards();
        player.clearSelectableCards();
        super.complete(player);
    }

    discardCards(player, cards, callback) {
        if(cards.length > 0) {
            player.discardCards(cards, false, callback, { isUpkeep: true });
            this.game.addMessage('{0} does not pay upkeep for {1} and discards them', player, cards);
        }
    }

    getRequiredUpkeep(player, upkeep) {
        const difference = upkeep - player.ghostrock;
        return difference < 0 ? 0 : difference;
    }

    getDudesWithUpkeep(player) {
        return player.cardsInPlay.filter(card => card.getType() === 'dude' && card.upkeep);
    }
}

module.exports = UpkeepPrompt;
