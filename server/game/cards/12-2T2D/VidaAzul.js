const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class VidaAzul extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities(ability) {
        this.action({
            title: 'Noon: Vida Azul',
            playType: ['noon'],
            cost: ability.costs.discardFromHand(),
            target: {
                activePromptTitle: 'Choose a dude',
                cardCondition: { 
                    location: 'play area', 
                    controller: 'any', 
                    condition: card => card.hasHorse() &&
                        card.isNearby(this.gamelocation)
                },
                cardType: ['dude']
            },
            handler: context => {
                let horses = context.target.getAttachmentsByKeywords(['horse']);
                if(!horses.length) {
                    return;
                }
                this.game.resolveGameAction(GameActions.unbootCard({ card: horses[0] }), context);
                horses[0].resetAbilities();
                this.game.addMessage('{0} uses {1} and discards {2} to unboot {3} and its abilities may be use another time', 
                    context.player, this, context.costs.discardFromHand, horses[0]);
                if(context.costs.discardFromHand.getType() === 'goods') {
                    this.game.resolveGameAction(GameActions.unbootCard({ card: context.target }), context).thenExecute(() => {
                        this.game.addMessage('{0} uses {1} to unboot {2}', 
                            context.player, this, context.target);
                    });
                }
            }
        });
    }
}

VidaAzul.code = '20024';

module.exports = VidaAzul;
