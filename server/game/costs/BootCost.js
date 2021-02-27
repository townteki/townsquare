const GameActions = require('../GameActions');

class BootCost {
    constructor() {
        this.name = 'boot';
    }

    isEligible(card) {
        return GameActions.bootCard({ card }).allow();
    }

    pay(cards, context) {
        context.game.resolveGameAction(
            GameActions.simultaneously(
                cards.map(card => GameActions.bootCard({ card }))
            ), context
        );
    }
}

module.exports = BootCost;
