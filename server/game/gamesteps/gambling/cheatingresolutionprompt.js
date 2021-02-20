const PlayerOrderPrompt = require('../playerorderprompt.js');

class CheatingResolutionPrompt extends PlayerOrderPrompt {
    constructor(game, playerNameOrder = []) {
        super(game, playerNameOrder);
        this.name = 'gambling';
        this.playWindowOpened = false;
    }

    activeCondition(player) {
        return super.activeCondition(player) && player.getOpponent().isCheatin();
    }

    activePrompt() {
        return {
            menuTitle: 'Play Cheatin\' Resolution?',
            buttons: [
                { arg: 'selected', text: 'Pass' }
            ]
        };
    }

    skipCondition(player) {
        return !player.getOpponent().isCheatin();
    }

    continue() {
        let completed = super.continue();

        if(!completed) {
            if(!this.playWindowOpened || !this.game.currentPlayWindow) {
                this.game.currentPlayWindow = this;
                this.playWindowOpened = true;
                this.game.raiseEvent('onPlayWindowOpened', { playWindow: this });
            }
        } else {
            this.game.currentPlayWindow = null;
            this.game.raiseEvent('onPlayWindowClosed', { playWindow: this });
        }

        return completed;
    }

    onMenuCommand(player) {
        this.markActionAsTaken(player);
    }

    markActionAsTaken(player) {
        if(player !== this.currentPlayer) {
            return false;
        }

        this.completePlayer();
    }
}

module.exports = CheatingResolutionPrompt;
