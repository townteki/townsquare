const ActionCard = require('../../actioncard.js');
const GameActions = require('../../GameActions/index.js');

class BurnEmOut extends ActionCard {
    setupCardAbilities(ability) {
        this.job({
            title: 'Burn \'Em Out',
            playType: 'noon',
            cost: ability.costs.bootLeader(),
            target: {
                activePromptTitle: 'Select outfit to burn',
                cardCondition: { location: 'play area', controller: 'opponent' },
                cardType: 'outfit',
                autoSelect: true
            },
            message: context =>
                this.game.addMessage('{0} plays {1} marking {2}', context.player, this, context.target),
            handler: context => {
                this.game.once('onLeaderPosseFormed', event => 
                    event.shootout.actOnLeaderPosse(dude => this.game.resolveGameAction(GameActions.addBounty({ card: dude }), context)));
            },
            onSuccess: (job, context) => {
                this.game.resolveGameAction(GameActions.lookAtHand({
                    player: context.player,
                    opponent: context.player.getOpponent(),
                    title: `Look at ${context.player.getOpponent().name}'s hand to ace a card`,
                    numToShow: context.player.getOpponent().hand.length,
                    onSelect: (player, cards) => player.aceCards(cards, false, () =>
                        context.game.addMessage('{0} uses {1} to ace {2} from {3}\'s hand', 
                            context.player, this, cards, context.player.getOpponent()), {}, context),
                    onCancel: () =>
                        context.game.addMessage('{0} uses {1}, but does not ace any card', context.player, this),
                    context,
                    source: this
                }), context);
            }
        });
    }
}

BurnEmOut.code = '18034';

module.exports = BurnEmOut;
