const GoodsCard = require('../../goodscard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class KineticAccretionActualizer extends GoodsCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities() {
        this.action({
            title: 'Shootout: Kinetic Accretion Actualizer',
            playType: ['shootout'],
            repeatable: true,
            limit: 1,
            isLimitForRound: true,
            message: context => 
                this.game.addMessage('{0} uses {1} to increase its bullet bonus by 1', context.player, this),
            handler: context => {
                this.untilEndOfRound(context.ability, ability => ({
                    match: this,
                    effect: ability.effects.modifyBullets(1)
                }));                
            }
        });
    }
}

KineticAccretionActualizer.code = '23040';

module.exports = KineticAccretionActualizer;
