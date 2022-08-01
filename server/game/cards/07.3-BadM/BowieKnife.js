const GameActions = require('../../GameActions/index.js');
const GoodsCard = require('../../goodscard.js');

class BowieKnife extends GoodsCard {
    constructor(owner, cardData) {
        super(owner, cardData, { useMeleeEffect: true, providesStudBonus: true });
    }
    setupCardAbilities(ability) {
        this.playAction({
            title: 'Bowie Knife: Equip',
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

BowieKnife.code = '18027';

module.exports = BowieKnife;
