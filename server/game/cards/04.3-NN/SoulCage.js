const GameActions = require('../../GameActions/index.js');
const GoodsCard = require('../../goodscard.js');

class SoulCage extends GoodsCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Soul Cage',
            playType: ['cheatin resolution'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose abomination',
                cardCondition: { 
                    location: ['dead pile', 'discard pile'], 
                    controller: 'current', 
                    condition: card => card.hasKeyword('abomination') &&
                        this.controller.getOpponent().getTotalRank() >= card.cost
                },
                cardType: ['dude'],
                gameAction: 'putIntoPlay'
            },
            message: context => 
                this.game.addMessage('{0} uses {1} to put {2} into play', context.player, this, context.target),
            handler: context => {
                this.game.resolveGameAction(GameActions.putIntoPlay({ 
                    player: context.player,
                    card: context.target,
                    params: {
                        targetLocationUuid: this.gamelocation,
                        context: context
                    } 
                }), context).thenExecute(() => {
                    if(this.game.shootout) {
                        this.game.resolveGameAction(GameActions.joinPosse({ card: context.target }), context);
                    }
                });
            }
        });
    }
}

SoulCage.code = '08016';

module.exports = SoulCage;
