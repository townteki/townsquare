const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

class SylvesterHeath extends DudeCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Noon/Shootout: Sylvester Heath',
            playType: ['noon', 'shootout'],
            cost: ability.costs.boot({
                type: ['spell', 'goods'],
                condition: card => card.parent === this && (card.isHex() || card.hasKeyword('mystical'))
            }),
            actionContext: { card: this, gameAction: 'moveDude' },
            handler: context => {
                this.game.promptForLocation(context.player, {
                    activePromptTitle: 'Select where this huckster should move to',
                    waitingPromptTitle: 'Waiting for opponent to select location for move',
                    cardCondition: { location: 'play area', condition: card => !card.isOutOfTown()},
                    onSelect: (player, location) => {
                        this.game.resolveGameAction(GameActions.moveDude({ 
                            card: this, 
                            targetUuid: location.uuid
                        }), context).thenExecute(() => 
                            this.game.addMessage('{0} uses {1} to move him to {2}', player, this, location));                                 
                        return true;
                    }
                });           
            }
        });   
    }
}

SylvesterHeath.code = '24047';

module.exports = SylvesterHeath;
