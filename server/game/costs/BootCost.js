const GameActions = require('../GameActions');

class BootCost {
    constructor(isBootLeader = false) {
        this.name = isBootLeader ? 'bootLeader' : 'boot';
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

    unpay(cards, context) {
        context.game.resolveGameAction(
            GameActions.simultaneously(
                cards.map(card => GameActions.unbootCard({ card }))
            ), context
        );
    }
}

module.exports = BootCost;
