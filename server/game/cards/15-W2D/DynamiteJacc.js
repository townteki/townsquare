const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class DynamiteJacc extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.action({
            title: 'Resolution: "Dynamite" Jacc',
            playType: ['resolution'],
            cost: [
                ability.costs.bootSelf(),
                ability.costs.aceSelf()
            ],
            handler: context => {
                this.game.resolveGameAction(GameActions.increaseCasualties({ 
                    player: context.player.getOpponent(), 
                    amount: 2
                }), context).thenExecute(() => {
                    this.game.addMessage('{0} boots and aces {1} to increase {2}\'s casualties by 2', 
                        context.player, this, context.player.getOpponent());
                });
            }
        });
    }
}

DynamiteJacc.code = '23002';

module.exports = DynamiteJacc;
