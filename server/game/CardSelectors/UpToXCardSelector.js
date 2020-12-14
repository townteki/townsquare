const BaseCardSelector = require('./BaseCardSelector.js');

class UpToXCardSelector extends BaseCardSelector {
    constructor(numCards, properties) {
        super(properties);

        this.numCards = numCards;
    }

    defaultActivePromptTitle() {
        return this.numCards === 1 ? 'Select a card' : `Select ${this.numCards} cards`;
    }

    hasReachedLimit(selectedCards) {
        return selectedCards.length >= this.numCards;
    }
}

module.exports = UpToXCardSelector;
