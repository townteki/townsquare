const ActionCard = require('../../actioncard.js');

class TheWinningAgenda extends ActionCard {
    setupCardAbilities() {
        this.action({
            title: 'Noon: The Winning Agenda',
            playType: 'noon',
            target : {
                activePromptTitle: 'Select a dude',
                waitingPromptTitle: 'Waiting for opponent to select a dude',
                cardCondition: { 
                    location: 'play area', 
                    condition: card => this.controller.hand.length >= 3 || card.influence <= this.controller.hand.length 
                },
                cardType: 'dude'
            },
            handler: context => {
                /* We have to cap the maximum number to 3 */
                let discardAmount = context.target.influence;
                if(discardAmount > 3) {
                    discardAmount = 3;
                }
                context.player.redrawFromHand(discardAmount, () => { 
                    this.game.addMessage('{0} uses {1} and {2}\'s influence to discard {3} cards and then draw {3} cards', 
                        context.player, this, context.target, discardAmount);
                }, { 
                    title: this.title, 
                    activePromptTitle: 'Select exactly ' + discardAmount + ' cards to discard', 
                    waitingPromptTitle: 'Waiting for opponent to discard ' + discardAmount + ' cards',
                    discardExactly: true 
                });
            }
        });
        this.action({
            title: 'Cheatin\' Resolution: The Winning Agenda',
            playType: 'cheatin resolution',
            target: {
                cardCondition: { location: 'play area', controller: 'current' },
                cardType: 'dude'
            },
            handler: context => {
                let rankMod = context.target.influence;
                /* We have to cap the maximum number to 3 */
                if(rankMod > 3) {
                    rankMod = 3;
                }
                context.player.modifyRank(rankMod);
                this.game.addMessage('{0} uses {1} and {2}\'s influence to increase their hand rank by {3}; Current rank is {4}', 
                    context.player, this, context.target, rankMod, context.player.getTotalRank());
            }
        });
    } 
}

TheWinningAgenda.code = '19045';

module.exports = TheWinningAgenda;
