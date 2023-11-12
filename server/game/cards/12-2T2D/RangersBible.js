const GoodsCard = require('../../goodscard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class RangersBible extends GoodsCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.action({
            title: 'Cheatin\' Resolution: Ranger\'s Bible',
            playType: ['cheatin resolution'],
            cost: ability.costs.bootSelf(),
            choosePlayer: true,
            ifCondition: context => this.game.shootout && !context.player.isCheatin(),
            ifFailMessage: context => {
                if(!this.game.shootout) {
                    this.game.addMessage('{0} uses {1}, but it does not have any effect because it is not shootout', 
                        context.player, this);
                } else {
                    this.game.addMessage('{0} uses {1}, but it does not have any effect because {0} is cheatin\'', 
                        context.player, this);
                }
            },
            handler: context => {
                const parentInf = this.parent.influence > 4 ? 4 : this.parent.influence;
                if(context.chosenPlayer.modifyRank(-1 * parentInf, context)) {
                    this.game.addMessage('{0} uses {1} to lower {2}\'s hand rank by {3}', 
                        context.player, this, context.chosenPlayer, this.parent.influence > 4 ? 4 : this.parent.influence);
                }
            }
        });
    }
}

RangersBible.code = '20041';

module.exports = RangersBible;
