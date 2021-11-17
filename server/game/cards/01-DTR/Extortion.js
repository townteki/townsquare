const ActionCard = require('../../actioncard.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class Extortion extends ActionCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities() {
        this.action({
            title: 'Noon: Extortion',
            playType: ['noon'],
            target: {
                activePromptTitle: 'Choose a deed',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'current', 
                    condition: card => card.owner !== this.controller 
                },
                cardType: ['deed']
            },
            message: context => 
                this.game.addMessage('{0} uses {1} to gain {2} GR', 
                    context.player, this, context.target.production),
            handler: context => {
                context.player.modifyGhostRock(context.target.production);
            }
        });
    }
}

Extortion.code = '01132';

module.exports = Extortion;
