const ActionCard = require('../../actioncard.js');
const GameActions = require('../../GameActions');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class TooMuchAttention extends ActionCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities() {
        this.action({
            title: 'Noon: Boot a wanted Dude',
            playType: ['noon'],
            target: {
                activePromptTitle: 'Choose a dude',
                cardCondition: { location: 'play area', controller: 'any', wanted: true },
                cardType: ['dude'],
                gameAction: 'boot'
            },
            message: context => 
                this.game.addMessage('{0} uses {1} to boot {2}', context.player, this, context.target),
            handler: context => {
                this.game.resolveGameAction(GameActions.bootCard({ card: context.target }), context);
            }
        });

        this.action({
            title: 'Noon: Boot a card with 1 or more CP',
            playType: ['noon'],
            target: {
                activePromptTitle: 'Choose a card',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'any', 
                    condition: card => card.control
                },
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

TooMuchAttention.code = '02021';

module.exports = TooMuchAttention;
