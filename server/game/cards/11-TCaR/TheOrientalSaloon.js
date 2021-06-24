const DeedCard = require('../../deedcard.js');
const GameActions = require('../../GameActions/index.js');

class TheOrientalSaloon extends DeedCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            match: this,
            effect: ability.effects.determineControlByBullets()
        });

        this.reaction({
            title: 'Oriental Saloon',
            when: {
                onDrawHandsRevealed: () => this.controller.isCheatin()
            },
            cost: [ability.costs.bootSelf()],
            target: {
                activePromptTitle: 'Choose a dude to unboot',
                choosingPlayer: 'current',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'current', 
                    condition: card => card.booted &&
                        !card.locationCard.isOutOfTown()
                },
                cardType: ['dude'],
                gameAction: 'unboot'
            },
            message: context => 
                this.game.addMessage('{0} uses {1} to unboot {2} and give them 2 bounty', context.player, this, context.target),
            handler: context => {
                this.game.resolveGameAction(GameActions.unbootCard({ card: context.target }), context);
                this.game.resolveGameAction(GameActions.addBounty({ card: context.target, amount: 2 }), context);
            }
        });
    }
}

TheOrientalSaloon.code = '19025';

module.exports = TheOrientalSaloon;
