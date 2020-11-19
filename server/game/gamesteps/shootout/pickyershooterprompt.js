const PlayerOrderPrompt = require('../playerorderprompt.js');

class PickYerShooterPrompt extends PlayerOrderPrompt {
    constructor(game, playerNameOrder) {
        super(game, playerNameOrder);
        this.shootout = game.shootout;
    } 

    continue() {
        this.game.promptForSelect(this.currentPlayer, {
            activePromptTitle: 'Select Yer Shooter',
            cardCondition: card => card.getType() === 'dude' && 
                this.shootout.isDudeInShootout(card),
            onSelect: (player, card) => {
                return true;
            }
        });

        this.completePlayer();
        return this.isComplete();        
    }

}

module.exports = PickYerShooterPrompt;
