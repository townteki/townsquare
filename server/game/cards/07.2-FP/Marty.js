const GameActions = require('../../GameActions/index.js');
const GoodsCard = require('../../goodscard.js');

class Marty extends GoodsCard {
    setupCardAbilities(ability) {
        this.attachmentRestriction({ keyword: 'mad scientist' });

        this.whileAttached({
            condition: () => true,
            effect: ability.effects.modifySkillRating('mad scientist', 1)
        });

        this.reaction({
            title: 'React: Marty',
            when: {
                onGadgetInventing: event => event.scientist === this.parent && event.bootedToInvent
            },
            cost: ability.costs.bootSelf(),
            message: context => 
                this.game.addMessage('{0} uses {1} to unboot {2}', context.player, this, this.parent),
            handler: context => {
                this.game.resolveGameAction(GameActions.unbootCard({ card: this.parent }), context);
            }
        });
    }
}

Marty.code = '12016';

module.exports = Marty;
