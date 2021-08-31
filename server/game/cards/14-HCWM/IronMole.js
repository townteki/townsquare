const GameActions = require('../../GameActions/index.js');
const GoodsCard = require('../../goodscard.js');

class IronMole extends GoodsCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            targetController: 'any',
            condition: () => this.locationCard && this.locationCard.isOutOfTown(),
            match: card => card.uuid === this.gamelocation,
            effect: ability.effects.modifyProduction(1)
        });
        
        this.action({
            title: 'Noon: Move to Out of Town',
            playType: ['noon'],
            cost: ability.costs.bootSelf(),
            target: {
                activePromptTitle: 'Select Out of Town deed',
                choosingPlayer: 'current',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'any', 
                    condition: card => card.isOutOfTown()
                },
                cardType: ['deed']
            },
            actionContext: { card: this.parent, gameAction: 'moveDude' },
            message: context => 
                this.game.addMessage('{0} uses {1} to move {2} to {3}', context.player, this, this.parent, context.target),
            handler: context => {
                this.game.resolveGameAction(GameActions.moveDude({ card: this.parent, targetUuid: context.target.uuid }), context);
            }
        });

        this.action({
            title: 'Shootout: Join Posse',
            playType: ['shootout:join'],
            cost: ability.costs.bootSelf(),
            ifCondition: () => this.locationCard && this.locationCard.isOutOfTown(),
            ifFailMessage: context =>
                this.game.addMessage('{0} uses {1} but it fails because {2} is not out of town', context.player, this, this.parent),
            actionContext: { card: this.parent, gameAction: 'joinPosse' },
            message: context => 
                this.game.addMessage('{0} uses {1} to join {2} to posse', context.player, this, this.parent),
            handler: context => {
                this.game.resolveGameAction(GameActions.joinPosse({ card: this.parent }), context);
            }
        });
    }
}

IronMole.code = '22040';

module.exports = IronMole;
