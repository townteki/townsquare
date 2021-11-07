const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class JudgeWellsSpicer extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.action({
            title: 'Noon: Judge Wells Spicer',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose dude to send home',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'opponent', 
                    condition: card => card.gamelocation === this.gamelocation &&
                        card.influence < card.bounty 
                },
                cardType: ['dude'],
                gameAction: ['sendHome', 'boot']
            },
            handler: context => {
                this.game.resolveGameAction(GameActions.sendHome({ card: context.target }), context).thenExecute(() => {
                    this.game.addMessage('{0} uses {1} to send {2} home booted', context.player, this, context.target);
                });
                this.game.promptForYesNo(context.target.owner, {
                    title: `Do you want to reduce ${context.target.title}'s bounty to 0?`,
                    onYes: player => {
                        this.game.resolveGameAction(GameActions.removeBounty({ 
                            card: context.target, 
                            options: { removeAll: true }
                        }), context).thenExecute(() => {
                            this.game.addMessage('{0} decides to remove all bounty from {1} after he was found guilty by {2}', 
                                player, context.target, this);
                        });
                    },
                    source: this
                });
            }
        });
    }
}

JudgeWellsSpicer.code = '22020';

module.exports = JudgeWellsSpicer;
