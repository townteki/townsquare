const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');
/** @typedef {import('../../AbilityDsl')} AbilityDsl */

class FearsNoOwls extends DudeCard {
    /** @param {AbilityDsl} ability */
    setupCardAbilities() {
        this.action({
            title: 'Noon: Fears No Owls',
            playType: ['noon'],
            target: {
                activePromptTitle: 'Choose your dude to move',
                cardCondition: { location: 'play area', controller: 'current' },
                cardType: ['dude']
            },
            handler: context => {
                this.game.promptForLocation(context.player, {
                    activePromptTitle: 'Select destination',
                    waitingPromptTitle: 'Waiting for opponent to select location',
                    cardCondition: { 
                        location: 'play area', 
                        condition: card => card.hasKeyword('holy ground') ||
                            (card.getType() === 'deed' && card.hasAttachmentWithKeywords(['totem']))
                    },
                    onSelect: (player, location) => {
                        this.game.resolveGameAction(GameActions.moveDude({ 
                            card: context.target, 
                            targetUuid: location.uuid
                        }), context);   
                        this.game.addMessage('{0} uses {1} to move {2} to {3}', player, this, context.target, location);                                 
                        return true;
                    },
                    source: this
                });                
            }
        });
    }
}

FearsNoOwls.code = '19007';

module.exports = FearsNoOwls;
