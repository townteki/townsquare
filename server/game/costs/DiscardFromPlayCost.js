class DiscardFromPlayCost {
    constructor() {
        this.name = 'discardFromPlay';
    }

    isEligible(card) {
        return card.location === 'play area';
    }

    pay(cards, context) {
        context.savedParents = [];
        cards.forEach(card => card.parent ? context.savedParents.push({ 
            parent: card.parent,
            discardedCard: card
        }) : null);
        context.player.discardCards(cards, false);
    }
}

module.exports = DiscardFromPlayCost;
