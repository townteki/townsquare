const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

class TheAngler extends DudeCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Call Out',
            playType: 'noon',
            target: {
                location: 'play area',
                cardCondition: card => card.locationCard === this.locationCard && card.value === this.value && card.getType() === 'dude' && card.controller !== this.controller
            },
            message: context => {
                this.game.addMessage('{0} uses {1} to call out {2}', this.controller, this, context.target)
            },
            handler: context => {
                this.game.resolveGameAction(GameActions.callOut({ caller: this, callee: context.target }), context);
            }
        });
    }
}

TheAngler.code = '23012';

module.exports = TheAngler;
