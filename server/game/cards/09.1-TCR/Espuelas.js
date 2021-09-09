const GameActions = require('../../GameActions/index.js');
const GoodsCard = require('../../goodscard.js');

class Espuelas extends GoodsCard {
    setupCardAbilities(ability) {
        this.whileAttached({
            condition: () => this.parent && this.parent.hasHorse(),
            effect: ability.effects.modifyInfluence(1)
        });

        this.action({
            title: 'Noon: Espuelas',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Choose location to move to',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'any', 
                    condition: (card) => this.parent && card.isAdjacent(this.parent.gamelocation)
                },
                cardType: ['location']
            },
            actionContext: { card: this.parent, gameAction: 'moveDude '},
            ifCondition: () => this.parent && this.parent.hasHorse(),
            ifFailMessage: context =>
                this.game.addMessage('{0} uses {1} but it fails as {2} does not have a horse', 
                    context.player, this, this.parent),
            message: context => this.game.addMessage('{0} uses {1} to move {2} to {3}', 
                context.player, this, this.parent, context.target),
            handler: context => {
                this.game.resolveGameAction(GameActions.moveDude({ card: this.parent, targetUuid: context.target.uuid }), context);
            }
        });
    }
}

Espuelas.code = '15012';

module.exports = Espuelas;
