const BaseCardSelector = require('./BaseCardSelector.js');

class EachPlayerCardSelector extends BaseCardSelector {
    constructor(properties) {
        super(properties);
        this.numCardsPerPlayer = properties.numCards;
    }

    canTarget(card, context, selectedCards) {
        return super.canTarget(card, context, selectedCards || []) && !this.isPlayerSatisfied(card, selectedCards || []);
    }

    isPlayerSatisfied(card, selectedCards) {
        let count = selectedCards.filter(selectedCard => selectedCard.controller.equals(card.controller)).length;
        return count >= this.numCardsPerPlayer;
    }

    defaultActivePromptTitle() {
        return this.numCardsPerPlayer === 1 ? 'Select a card controlled by each player' :
            `Select ${this.numCardsPerPlayer} cards controlled by each player`;
    }

    hasEnoughSelected(selectedCards, numPlayers) {
        return selectedCards.length === 0 && this.optional || selectedCards.length === (numPlayers * this.numCardsPerPlayer);
    }

    hasEnoughTargets(context) {
        return this.optional || context.game.getPlayers().every(player => {
            let playerCards = context.game.allCards.filter(card => card.controller.equals(player));
            let matchingCards = playerCards.filter(card => super.canTarget(card, context));
            return matchingCards.length >= this.numCardsPerPlayer;
        });
    }

    hasReachedLimit(selectedCards, numPlayers) {
        return selectedCards.length >= (numPlayers * this.numCardsPerPlayer);
    }
}

module.exports = EachPlayerCardSelector;
