const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

class Mazatl extends DudeCard {
    setupCardAbilities() {
        this.action({
            title: 'Mazatl',
            playType: ['noon'],
            target: {
                activePromptTitle: 'Choose destination',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'any', 
                    condition: card => card.hasAttachment(att => att.hasKeyword('totem')) 
                },
                cardType: ['location']
            },
            actionContext: { card: this, gameAction: 'moveDude' },
            message: context => 
                this.game.addMessage('{0} uses {1} to move himself to {2}', context.player, this, context.target),
            handler: context => {
                this.game.resolveGameAction(GameActions.moveDude({ card: this, targetUuid: context.target.uuid }), context);
            }
        });
    }
}

Mazatl.code = '09017';

module.exports = Mazatl;
