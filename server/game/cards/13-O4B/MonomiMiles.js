const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

class MonomiMiles extends DudeCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Monomi Miles',
            playType: ['resolution'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Select Miles\'s Sidekick',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'current', 
                    condition: card => card.parent === this &&
                        card.hasKeyword('sidekick') 
                },
                cardType: ['goods', 'spell'],
                autoSelect: true
            },
            ifCondition: () => {
                if(this.controller.isCheatin()) {
                    return false;
                }
                return this.controller.getTotalRank() > this.controller.getOpponent().getTotalRank();
            },
            ifFailMessage: context => {
                if(this.controller.isCheatin()) {
                    this.game.addMessage('{0} uses {1} but it does not have any effect because their hand is cheatin\'',
                        context.player, this);
                } else {
                    this.game.addMessage('{0} uses {1} but it does not have any effect because their hand rank is not higher',
                        context.player, this);
                }
            },
            handler: context => {
                const kfRating = this.getKungFuRating();
                this.game.resolveGameAction(GameActions.increaseCasualties({ 
                    player: context.player, 
                    amount: kfRating
                }), context).thenExecute(() => {
                    this.game.addMessage('{0} uses {1} to increase casualties of their posse by {2}', 
                        context.player, this, kfRating);
                });
                this.game.resolveGameAction(GameActions.increaseCasualties({ 
                    player: context.player.getOpponent(), 
                    amount: kfRating
                }), context).thenExecute(() => {
                    this.game.addMessage('{0} uses {1} to increase casualties of {2}\'s posse by {3}', 
                        context.player, this, context.player.getOpponent(), kfRating);
                });                           
            }
        });
    }
}

MonomiMiles.code = '21015';

module.exports = MonomiMiles;
