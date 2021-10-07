const GameActions = require('../../GameActions/index.js');
const GoodsCard = require('../../goodscard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class CavalryEscort extends GoodsCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.reaction({
            title: 'React: Cavalry Escort',
            when: {
                onShootoutCasualtiesStepStarted: () => true
            },
            cost: ability.costs.bootSelf(),
            actionContext: { card: this.parent, gameAction: 'joinPosse' },
            message: context => this.game.addMessage('{0} uses {1} to ', context.player, this),
            handler: context => {
                this.game.resolveGameAction(GameActions.joinPosse({ 
                    card: this.parent,
                    options: { needToBoot: true }
                }), context);
            }
        });
    }
}

CavalryEscort.code = '19032';

module.exports = CavalryEscort;
