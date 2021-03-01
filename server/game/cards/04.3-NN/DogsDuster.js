const GameActions = require('../../GameActions/index.js');
const GoodsCard = require('../../goodscard.js');

class DogsDuster extends GoodsCard {
    setupCardAbilities(ability) {
        this.whileAttached({
            condition: () => !this.parent.isWanted(),
            effect: ability.effects.modifyInfluence(1)
        });
        this.whileAttached({
            condition: () => this.parent.hasKeyword('Deputy'),
            effect: ability.effects.doesNotGetBountyOnJoin()
        });
        this.action({
            title: 'Dog\'s Duster',
            playType: 'noon',
            costs: ability.costs.bootSelf(),
            condition: () => !this.parent.booted,   
            target: {
                activePromptTitle: 'Select dude to call out',
                cardCondition: { location: 'play area', wanted: true, controller: 'opponent' },
                cardType: 'dude'
            },
            handler: context => {
                this.game.resolveGameAction(GameActions.callOut({ caller: this.parent, callee: context.target }), context);
                this.game.addMessage('{0} uses {1}\'s {2} to call out {3}.', context.player, this.parent, this, context.target);
            }
        });
    }
}

DogsDuster.code = '08013';

module.exports = DogsDuster;
