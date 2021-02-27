const GameActions = require('../GameActions');

class LowerBountyCost {
    constructor() {
        this.name = 'lowerBounty';
    }

    isEligible(card) {
        return GameActions.removeBounty({ card }).allow();
    }

    pay(cards, context) {
        context.game.resolveGameAction(
            GameActions.simultaneously(
                cards.map(card => GameActions.removeBounty({ card }))
            ), context
        );
    }
}

module.exports = LowerBountyCost;
