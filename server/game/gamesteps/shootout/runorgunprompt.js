const PlayerOrderPrompt = require('../playerorderprompt.js');

class RunOrGunPrompt extends PlayerOrderPrompt {
    constructor(game, playerNameOrder) {
        super(game, playerNameOrder);
        this.shootout = game.shootout;
    } 

    continue() {
        if (this.isComplete()) {
            return true;
        }
        if (this.shootout.getPosseByPlayer(this.currentPlayer).isEmpty()) {
            this.completePlayer();
            return this.continue();
        }

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
                cards.forEach(card => this.shootout.runHome(card));
                this.completePlayer();
                return true;
            },
            onCancel: () => {
                this.completePlayer();
                return true;
            },
            onMenuCommand: (player, arg) => {
                if (this.shootout.leaderPlayer === player) {
                    this.shootout.actOnLeaderPosse(card => this.shootout.runHome(card));
                } else if (this.shootout.markPlayer === player) {
                    this.shootout.actOnMarkPosse(card => this.shootout.runHome(card));
                }
                this.completePlayer();
                return true;
            }
        });

        return false;        
    }

}

module.exports = RunOrGunPrompt;
