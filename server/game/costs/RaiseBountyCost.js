const GameActions = require('../GameActions');

class RaiseBountyCost {
    constructor() {
        this.name = 'raiseBounty';
    }

    isEligible(card) {
        return GameActions.addBounty({ card }).allow();
    }

    pay(cards, context) {
        context.game.resolveGameAction(
            GameActions.simultaneously(
                cards.map(card => GameActions.addBounty({ card }))
            ), context
        );
    }
}

module.exports = RaiseBountyCost;
