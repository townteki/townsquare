const PlayerOrderPrompt = require('../playerorderprompt.js');

class ShootoutPossePrompt extends PlayerOrderPrompt {
    constructor(game, shootout, playerNameOrder) {
        super(game, playerNameOrder);
        this.shootout = shootout;
    }  

    continue() {
        if (!this.isComplete()) {
            this.game.promptForSelect(this.currentPlayer, {
                activePromptTitle: 'Select dudes to join posse',
                multiSelect: true,
                numCards: 0,
                cardCondition: card => card.getType() === 'dude' && 
                    card.location === 'play area' &&
                    card.controller === this.currentPlayer &&
                    card !== this.shootout.mark &&
                    card !== this.shootout.leader &&
                    card.canJoinPosse(),
                onSelect: (player, dudeSelection) => {
                    dudeSelection.forEach(dude => this.shootout.addToPosse(dude));
                    if (this.shootout.leaderPlayer === player) {
                        this.game.addMessage('{0} with {1} as leader forms their posse including dudes: {2}.', player, this.shootout.leader, dudeSelection);
                    } else {
                        this.game.addMessage('{0} with {1} as mark forms their posse including dudes: {2}.', player, this.shootout.mark, dudeSelection);   
                    }                 
                    this.completePlayer();                 
                    return true;
                }
            });
        }
        return this.isComplete();
    }

}

module.exports = ShootoutPossePrompt;
