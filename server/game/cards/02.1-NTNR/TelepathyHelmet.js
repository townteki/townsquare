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
            handler: context => {
                const scannee = context.player.getOpponent();
                if(scannee.hand.length) {
                    this.game.resolveGameAction(GameActions.lookAtHand({
                        player: context.player,
                        opponent: scannee,
                        title: `Look at ${scannee.name}'s hand`,
                        numToShow: scannee.hand.length,
                        context
                    }), context);
                    this.game.addMessage('{0} uses {1} to look at {2}\'s play hand', context.player, this, scannee);
                } else {
                    this.game.addMessage('{0} uses {1}, but {2} has no cards in hand', context.player, this, scannee);
                }
            }
        });
    }
}

TelepathyHelmet.code = '02013';

module.exports = TelepathyHelmet;
