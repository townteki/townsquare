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
                multiSelect: true,
                additionalButtons: [
                    { text: 'All dudes run', arg: 'allrun' }
                ],
                cardCondition: card => card.controller === this.currentPlayer && 
                    card.location === 'play area' &&
                    card.getType() === 'dude' &&
                    this.shootout.isInShootout(card),
                onSelect: (player, cards) => {
                    cards.forEach(card => card.sendHome());
                    this.completePlayer();
                    return true;
                },
                onCancel: () => {
                    this.completePlayer();
                    return true;
                },
                onMenuCommand: (player, arg) => {
                    if (this.shootout.leaderPlayer === player) {
                        this.shootout.actOnLeaderPosse(card => card.sendHome());
                    } else if (this.shootout.markPlayer === player) {
                        this.shootout.actOnMarkPosse(card => card.sendHome());
                    }
                    this.completePlayer();
                    return true;
                }
            });
        }

        return this.isComplete();        
    }

}

module.exports = RunOrGunPrompt;
