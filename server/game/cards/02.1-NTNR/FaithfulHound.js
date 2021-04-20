const GameActions = require('../../GameActions/index.js');
const GoodsCard = require('../../goodscard.js');

class FaithfulHound extends GoodsCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Faithful Hound',
            playType: ['shootout'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose a goods',
                cardCondition: { location: 'play area', controller: 'opponent', condition: card => card.parent.isParticipating() },
                cardType: ['goods'],
                gameAction: 'discard'
            },
            handler: context => {
                context.player.handlePull({
                    successCondition: pulledValue => pulledValue < context.target.value,
                    successHandler: () => {
                        this.game.addMessage('{0} uses {1} to discard {2}', context.player, this, context.target);
                        this.game.resolveGameAction(GameActions.discardCard({ card: context.target }), context);
                    },
                    failHandler: () => {
                        this.game.addMessage('{0} uses {1} and tries to discard {2}, but fails', context.player, this, context.target);
                    },
                    source: this
                }, context);
            }
        });
    }
}

FaithfulHound.code = '02014';

module.exports = FaithfulHound;
