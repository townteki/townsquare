const ContinuousPlayerOrderPrompt = require('./continuousplayerorderprompt.js');

class PlayWindow extends ContinuousPlayerOrderPrompt {
    constructor(game, name, activePromptTitle, playerNameOrder = [], buttonFunctions = {}) {
        super(game, activePromptTitle, playerNameOrder, buttonFunctions);
        this.name = name;
        this.playWindowOpened = false;
    }

    skipCondition() {
        if(this.game.shootout && this.game.shootout.checkEndCondition()) {
            return true;
        }
        return false; 
    }

    continue() {
        let result = super.continue();

        if(!this.isComplete()) {
            if(!this.playWindowOpened || !this.game.currentPlayWindow) {
                this.game.currentPlayWindow = this;
                this.playWindowOpened = true;
                this.game.raiseEvent('onPlayWindowOpened', { playWindow: this });
            }
        } else {
            this.game.currentPlayWindow = null;
            this.game.raiseEvent('onPlayWindowClosed', { playWindow: this });
        }

        return result;
    }

    markActionAsTaken(player) {
        this.onDone(player);
    }

    completePlayer() {
        this.game.addMessage('{0} passes {1} action', this.currentPlayer, this.name);
        super.completePlayer();
    }
}

module.exports = PlayWindow;
