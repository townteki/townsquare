const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class Buskers extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities() {
        this.reaction({
            title: 'React: Buskers',
            when: {
                onDudeMoved: event => event.target === this.gamelocation &&
                    event.card.controller.ghostrock > this.controller.ghostrock
            },
            handler: context => {
                if(context.event.card.controller.getSpendableGhostRock() >= 2) {
                    this.game.transferGhostRock({
                        amount: 2,
                        from: context.event.card.controller,
                        to: context.player
                    });
                    this.game.addMessage('{0} uses {1} and forces {2} to pay them 2 GR', 
                        context.player, this, context.event.card.controller);
                } else {
                    this.game.resolveGameAction(GameActions.bootCard({ card: context.event.card }), context).thenExecute(() => {
                        this.game.addMessage('{0} uses {1} to boot {2}', context.player, this, context.event.card);
                    });
                }
            }
        });
    }
}

Buskers.code = '20007';

module.exports = Buskers;
