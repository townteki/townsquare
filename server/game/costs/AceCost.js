class AceCost {
    constructor() {
        this.name = 'ace';
    }

    isEligible(card) {
        return card.location !== 'dead pile' && card.canBeAced();
    }

    pay(cards, context) {
        context.player.aceCards(cards, { allowSave: false });
    }
}

module.exports = AceCost;
