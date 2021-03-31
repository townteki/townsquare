const GameActions = require('../../GameActions/index.js');
const GoodsCard = require('../../goodscard.js');

class AutoRevolver extends GoodsCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            condition: () => this.parent && this.parent.isParticipating(),
            match: this.controller,
            effect: [
                ability.effects.addRedrawBonus(1)
            ]
        });
        this.playAction({
            title: 'Shootout play: Equip',
            condition: () => this.game.shootout,
            cost: ability.costs.payReduceableGRCost(),
            playType: 'shootout',
            target: {
                activePromptTitle: 'Select dude to be equipped',
                cardCondition: card => card.location === 'play area' && card.getType() === 'dude' && card.isParticipating() &&
                    card.controller === this.controller
            },
            message: context => this.game.addMessage('{0} plays {1} and gives it to {2}', context.player, this, context.target),
            handler: context => {
                this.game.resolveGameAction(GameActions.putIntoPlay({ 
                    card: this, 
                    player: context.player, 
                    params: { 
                        playingType: 'ability',
                        targetParent: context.target, 
                        context: context
                    }
                }));
            }
        });
    }
}

AutoRevolver.code = '01089';

module.exports = AutoRevolver;
