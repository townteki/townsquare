class DiscardFromPlayCost {
    constructor() {
        this.name = 'discardFromPlay';
    }

    isEligible(card) {
        return card.location === 'play area';
    }

    pay(cards, context) {
        context.saveCostCardsInfo(cards);
        context.player.discardCards(cards, false);
    }
}

module.exports = DiscardFromPlayCost;
