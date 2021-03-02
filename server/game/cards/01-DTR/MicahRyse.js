const DudeCard = require('../../dudecard.js');
const GameActions = require('../../GameActions/index.js');

class MicahRyse extends DudeCard {
    setupCardAbilities(ability) {
        this.action({
            title: 'Micah Ryse',
            playType: ['noon'],
            cost: ability.costs.boot({
                type: 'spell',
                condition: card => card.isHex() && card.parent === this
            }),
            handler: context => {
                this.game.promptForLocation(context.player, {
                    activePromptTitle: 'Select where Mycah should move to',
                    waitingPromptTitle: 'Waiting for opponent to select location for Mycah',
                    onSelect: (player, location) => {
                        this.game.resolveGameAction(GameActions.moveDude({ 
                            card: this, 
                            targetUuid: location.uuid, 
                            options: { needToBoot: false, allowBooted: true }
                        }), context);   
                        this.game.addMessage('{0} uses {1} to move him to {2}.', player, this, location);                                 
                        return true;
                    }
                });                
            }
        });    
    }
}

MicahRyse.code = '01005';

module.exports = MicahRyse;
