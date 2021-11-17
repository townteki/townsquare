const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class DeadwoodDick extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.action({
            title: 'Cheatin\' Resolution: Deadwood Dick',
            playType: ['cheatin resolution'],
            cost: [
                ability.costs.choose({
                    'Boot Dick': ability.costs.bootSelf(),
                    'Boot Dick\'s Horse': ability.costs.boot(card => card.parent === this &&
                        card.hasKeyword('horse'))
                })
            ],
            target: {
                activePromptTitle: 'Choose dudes to send home',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'current', 
                    condition: card => card.hasHorse() 
                },
                cardType: ['dude'],
                multiSelect: true,
                numCards: 0,         
                gameAction: () => this.controller.isCheatin() ? ['sendHome', 'boot'] : 'sendHome'
            },
            handler: context => {
                const movedDudes = [];
                let action = GameActions.simultaneously(
                    context.target.map(card => GameActions.sendHome({
                        card,
                        options: { needToBoot: context.player.isCheatin() }
                    }).thenExecute(() => movedDudes.push(card)))
                );
                this.game.resolveGameAction(action, context).thenExecute(() => {
                    this.game.addMessage('{0} uses {1} to send {2} home{3}', 
                        context.player, this, movedDudes, context.player.isCheatin() ? ' booted' : '');
                });
            }
        });
    }
}

DeadwoodDick.code = '23006';

module.exports = DeadwoodDick;
