const GameActions = require('../../GameActions/index.js');
const GoodsCard = require('../../goodscard.js');

class TheEvidence extends GoodsCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Reduce bounty to 0',
            playType: 'noon',       
            target: {
                activePromptTitle: 'Select dude to be exonerated',
                cardCondition: { location: 'play area', wanted: true },
                cardType: 'dude',
                gameAction: 'removeBounty'
            },
            message: context =>
                this.game.addMessage('{0} plays {1} on {2} to reduce their bounty to 0', context.player, this, context.target),
            handler: context => {
                this.game.resolveGameAction(GameActions.removeBounty({ card: context.target, options: { removeAll: true } }), context);
                context.player.discardCard(this);
            }
        });
        this.action({
            title: 'Raise bounty by 2',
            playType: 'noon', 
            cost: ability.costs.payGhostRock(1),      
            target: {
                activePromptTitle: 'Select dude to be suspected',
                cardCondition: { location: 'play area' },
                cardType: 'dude',
                gameAction: 'addBounty'
            },
            message: context =>
                this.game.addMessage('{0} plays {1} on {2} to increase their bounty by 2', context.player, this, context.target),
            handler: context => {
                this.game.resolveGameAction(GameActions.addBounty({ card: context.target, amount: 2 }), context);
                this.game.resolveGameAction(GameActions.aceCard({ card: this, allowSave: false }), context);
            }
        });
    }
}

TheEvidence.code = '04014';

module.exports = TheEvidence;
