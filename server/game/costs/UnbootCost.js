const GameActions = require('../GameActions');

class UnbootCost {
    constructor() {
        this.name = 'unboot';
    }

    isEligible(card) {
        return GameActions.unbootCard({ card }).allow();
    }

    pay(cards, context) {
        context.game.resolveGameAction(
            GameActions.simultaneously(
                cards.map(card => GameActions.unbootCard({ card }))
            ), context
        );
    }
}

module.exports = UnbootCost;
