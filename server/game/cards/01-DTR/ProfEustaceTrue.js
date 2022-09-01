const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

class ProfEustaceTrue extends DudeCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Prof. Eustace True',
            playType: ['noon'],
            cost: ability.costs.discardFromPlay(card => 
                this.equals(card.parent) && card.isGadget()),
            actionContext: { card: this, gameAction: 'moveDude' },
            handler: context => {
                this.game.promptForLocation(context.player, {
                    activePromptTitle: 'Select where Eustace should move to',
                    waitingPromptTitle: 'Waiting for opponent to select location for Eustace',
                    cardCondition: { location: 'play area' },
                    onSelect: (player, location) => {
                        this.game.resolveGameAction(GameActions.moveDude({ 
                            card: this, 
                            targetUuid: location.uuid
                        }), context);   
                        this.game.addMessage('{0} uses {1}, discarding his {2} to move him to {3}',
                            player, this, context.costs.discardFromPlay, location);                                 
                        return true;
                    }
                });                
            }
        });
    }
}

ProfEustaceTrue.code = '01026';

module.exports = ProfEustaceTrue;
