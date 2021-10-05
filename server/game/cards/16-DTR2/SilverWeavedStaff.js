const GameActions = require('../../GameActions/index.js');
const GoodsCard = require('../../goodscard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class SilverWeavedStaff extends GoodsCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.action({
            title: 'Shootout: Silver-Weaved Staff',
            playType: ['shootout'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose a spell to boot',
                cardCondition: { location: 'play area', controller: 'opponent', participating: true },
                cardType: ['spell'],
                gameAction: 'boot'
            },
            message: context => 
                this.game.addMessage('{0} uses {1} to boot {2}', context.player, this, context.target),
            handler: context => {
                this.game.resolveGameAction(GameActions.bootCard({ card: context.target }), context);
            }
        });
    }
}

SilverWeavedStaff.code = '25215';

module.exports = SilverWeavedStaff;
