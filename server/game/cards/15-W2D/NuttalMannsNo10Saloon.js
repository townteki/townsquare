const DeedCard = require('../../deedcard.js');
const GameActions = require('../../GameActions');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class NuttalMannsNo10Saloon extends DeedCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.action({
            title: 'Noon: Nuttal & Mann\'s No.10 Saloon',
            playType: ['noon'],
            cost: [
                ability.costs.bootSelf(),
                ability.costs.payGhostRock(1)
            ],
            target: {
                activePromptTitle: 'Choose a dude to boot/unboot',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'any', 
                    condition: card => card.gamelocation === this.gamelocation 
                },
                cardType: ['dude'],
                gameAction: card => card.booted ? 'unboot' : 'boot'
            },
            handler: context => {
                if(context.target.booted) {
                    this.game.resolveGameAction(GameActions.unbootCard({ card: context.target }), context).thenExecute(() => {
                        this.game.addMessage('{0} uses {1} to unboot {2}', context.player, this, context.target);
                    });
                } else {
                    this.game.resolveGameAction(GameActions.bootCard({ card: context.target }), context).thenExecute(() => {
                        this.game.addMessage('{0} uses {1} to boot {2}', context.player, this, context.target);
                    });                    
                }
            }
        });
    }
}

NuttalMannsNo10Saloon.code = '23035';

module.exports = NuttalMannsNo10Saloon;
