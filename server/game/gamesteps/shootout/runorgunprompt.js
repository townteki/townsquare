const PlayerOrderPrompt = require('../playerorderprompt.js');

class RunOrGunPrompt extends PlayerOrderPrompt {
    constructor(game, playerNameOrder) {
        super(game, playerNameOrder);
        this.shootout = game.shootout;
    } 

    continue() {
        if (!this.isComplete()) {
            this.game.promptForSelect(this.currentPlayer, {
                activePromptTitle: 'Select dudes to flee the shootout',
                additionalButtons: [
                    { text: 'All dudes run', arg: 'allrun' }
                ],
                cardCondition: card => card.getType() === 'dude' && 
                    this.shootout.isDudeInShootout(card),
                onSelect: (player, card) => {
                    this.completePlayer();
                    return true;
                },
                onMenuCommand: (player, arg) => {
                    this.completePlayer();
                    return true;
                }
            });
        }

        return this.isComplete();        
    }

}

module.exports = RunOrGunPrompt;
