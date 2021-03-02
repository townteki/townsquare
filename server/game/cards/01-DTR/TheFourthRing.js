const GameActions = require('../../GameActions/index.js');
const OutfitCard = require('../../outfitcard.js');

class TheFourthRing extends OutfitCard {
    setupCardAbilities(ability) {
        this.reaction({
            when: {
                onPullSuccess: event => 
                    event.pullingDude && 
                    event.pullingDude.controller === this.controller && 
                    !event.pullingDude.isAtHome() &&
                    event.source.getType() === 'spell'
            },
            cost: [ability.costs.bootSelf()],
            handler: context => {
                this.game.promptForYesNo(context.player, {
                    title: 'Do you want to discard a card to gain 1 GR and draw a card?',
                    onYes: () => {
                        context.player.discardFromHand(1, discarded => {
                            this.game.resolveGameAction(GameActions.drawCards({ player: context.player, amount: 1 }), context).thenExecute(() => {
                                context.player.modifyGhostRock(1);
                                this.game.addMessage('{0} uses {1} to discard {2} to draw a card and gains 1 GR', context.player, this, discarded[0]);
                            });                            
                        }, { title: this.title });  
                    }                    
                });
            }
        });
    }
}

TheFourthRing.code = '01001';

module.exports = TheFourthRing;
