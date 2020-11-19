const PlayerOrderPrompt = require('../playerorderprompt.js');

class ShootoutPossePrompt extends PlayerOrderPrompt {
    constructor(game, playerNameOrder) {
        super(game, playerNameOrder);
        this.shootout = game.shootout;
    }  

    continue() {
        this.game.promptForSelect(this.currentPlayer, {
            activePromptTitle: 'Select dudes to join posse',
            cardCondition: card => card.getType() === 'dude' && card.location === 'play area',
            onSelect: (player, dudeCard) => {                             
                return true;
            }
        });
        
        this.completePlayer();
        return this.isComplete();
    }

}

module.exports = ShootoutPossePrompt;
