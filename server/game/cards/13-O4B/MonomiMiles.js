const DudeCard = require('../../dudecard.js');

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
            message: context => 
                this.game.addMessage('{0} uses {1} to increase casualties of both posses by {2}', 
                    context.player, this, this.getKungFuRating()),
            handler: context => {
                context.player.modifyCasualties(this.getKungFuRating());
                context.player.getOpponent().modifyCasualties(this.getKungFuRating());
            }
        });
    }
}

MonomiMiles.code = '21015';

module.exports = MonomiMiles;
