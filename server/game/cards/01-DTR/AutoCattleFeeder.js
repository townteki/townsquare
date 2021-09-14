const GoodsCard = require('../../goodscard.js');

class AutoCattleFeeder extends GoodsCard {
    setupCardAbilities(ability) {
        this.attachmentRestriction(card => 
            card.controller === this.controller &&
            card.getType() === 'deed' &&
            card.hasKeyword('Ranch'));

        this.action({
            title: 'Noon: Auto Cattle-Feeder',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            condition: context => this.parent && this.parent.controller === context.player,
            message: context => this.game.addMessage('{0} uses {1} to gain a GR', context.player, this),
            handler: context => {
                context.player.modifyGhostRock(1);
            }
        });
    }
}

AutoCattleFeeder.code = '01099';

module.exports = AutoCattleFeeder;