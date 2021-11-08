const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class WillaMaeMacGowanExp1 extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.action({
            title: 'Resolution: Willa Mae MacGowan (Exp.1)',
            playType: ['resolution'],
            cost: ability.costs.discardSelf(),
            target: {
                activePromptTitle: 'Choose dude to send home',
                choosingPlayer: 'current',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'current', 
                    participating: true,
                    condition: card => card !== this 
                },
                cardType: ['dude'],
                gameAction: ['sendHome', 'boot']
            },
            handler: context => {
                this.game.resolveGameAction(GameActions.sendHome({ 
                    card: context.target, 
                    options: { needToBoot: false } 
                }), context).thenExecute(() => {
                    if(context.target.booted && context.player.getOpponent().isCheatin()) {
                        this.game.resolveGameAction(GameActions.unbootCard({ card: context.target }), context).thenExecute(() => {
                            this.game.addMessage('{0} uses {1} and discards her to send {2} home and unboot them', 
                                context.player, this, context.target);
                        });
                    } else {
                        this.game.addMessage('{0} uses {1} and discards her to send {2} home', 
                            context.player, this, context.target);
                    }
                });
            }
        });
    }
}

WillaMaeMacGowanExp1.code = '23027';

module.exports = WillaMaeMacGowanExp1;
