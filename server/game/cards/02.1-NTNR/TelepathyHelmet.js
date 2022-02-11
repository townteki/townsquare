const GoodsCard = require('../../goodscard.js');
const GameActions = require('../../GameActions/index.js');

class TelepathyHelmet extends GoodsCard {
    setupCardAbilities(ability) {
        this.whileAttached({
            condition: () => this.controller.firstPlayer,
            effect: ability.effects.cannotBeAffectedByShootout('opponent')
        });

        this.action({
            title: 'Telepathy Helmet',
            playType: 'noon',
            cost: ability.costs.payGhostRock(1),
            repeatable: true,
            ifCondition: () => context.player.getOpponent().hand.length,
            ifFailMessage: context => this.game.addMessage('{0} uses {1}, but {2} has no cards in hand', context.player, this, context.player.getOpponent()),
            message: context => this.game.addMessage('{0} uses {1} to look at {2}\'s play hand', context.player, this, context.player.getOpponent()),
            handler: context => {
                const scannee = context.player.getOpponent();
                this.game.resolveGameAction(GameActions.lookAtHand({
                    player: context.player,
                    opponent: scannee,
                    title: `Look at ${scannee.name}'s hand`,
                    numToShow: scannee.hand.length,
                    context
                }), context);
            }
        });
    }
}

TelepathyHelmet.code = '02013';

module.exports = TelepathyHelmet;
